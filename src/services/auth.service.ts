import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs"; // For password hashing
import jwt from "jsonwebtoken"; // For JWT generation
import { db } from "@/db"; // Your Drizzle ORM instance initialized with your schema
import { users } from "@/schema"; // Your Drizzle schema for the 'users' table
import { eq } from "drizzle-orm"; // Drizzle operator for equality
import { SignupInput } from "@/validators/signup.validator"; // Zod schema types for validation
import { LoginInput } from "@/validators/login.validator";
import { ApiError } from "@/miidleware/serviceResponse";
import { ServiceResponse } from "@/miidleware/serviceResponse";


export interface IServiceResponse<T> {
    statusCode: StatusCodes;
    message: string;
    success: boolean;
    data: T | null;
  }

class AuthService {

  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_please_change_me';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; 
    if (this.JWT_SECRET === 'your_super_secret_jwt_key_please_change_me') {
      console.warn("SECURITY WARNING: JWT_SECRET is not set in your environment variables (.env file). Using a default placeholder. This is highly insecure for production!");
      console.warn("Please add JWT_SECRET=\"YOUR_LONG_RANDOM_SECRET\" to your .env file.");
    }
}
  

  /**
   * @method signup
   * @description Registers a new user in the database.
   * Performs the following steps:
   * 1. Checks if a user with the provided email already exists to enforce uniqueness.
   * 2. Hashes the user's password using bcrypt for secure storage.
   * 3. Inserts the new user record into the 'users' table using Drizzle ORM.
   * 4. Returns a success response or throws an ApiError on failure (e.g., email conflict).
   *
   * @param signupDetails - An object containing the new user's name, email, password, and role.
   * This data is expected to be already validated by a Zod schema in the controller.
   * @returns {Promise<IServiceResponse<any>>} - A standardized service response.
   * @throws {ApiError} - Throws an ApiError if the email is already registered or user creation fails.
   */
  public async signup(signupDetails: SignupInput): Promise<IServiceResponse<any>> {
    const { name, email, password, role } = signupDetails;

    // Step 1: Check for existing user by email to ensure uniqueness.
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      // If a user with this email already exists, throw a CONFLICT error.
      throw new ApiError(StatusCodes.CONFLICT, "Email already registered");
    }

    // Step 2: Hash the password for secure storage.
    const salt = await bcrypt.genSalt(10); // Generate a salt (recommended iterations: 10-12)
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt

    // Step 3: Insert the new user into the database.
    // The `.returning()` method is crucial to get the inserted row data back from the database.
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword, // Store the hashed password in the database
      role,
    }).returning(); // Returns the created user object

    // Step 4: Validate if the user was successfully created.
    if (!newUser) {
      // If `returning()` didn't return a user, something went wrong during insertion.
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    // Prepare user data for the response (remove sensitive info like password before sending to client).
    const userResponse = { ...newUser, password: undefined }; // Create a new object without the password

    // Return a successful ServiceResponse with the created user data.
    return ServiceResponse(
      StatusCodes.CREATED, // HTTP status code for successful creation
      "User signed up successfully",
      true, // Indicate success
      userResponse // The data payload
    );
  }

  /**
   * @method login
   * @description Authenticates a user based on email and password.
   * Performs the following steps:
   * 1. Finds the user in the database by email.
   * 2. Compares the provided plain-text password with the stored hashed password.
   * 3. If credentials are valid, generates a JSON Web Token (JWT) for authentication.
   * 4. Returns a success response with the JWT and basic user information.
   *
   * @param loginCredentials - An object containing the user's email and password.
   * This data is expected to be already validated by a Zod schema.
   * @returns {Promise<IServiceResponse<ILoginResponseData>>} - A standardized service response containing the token and user data.
   * @throws {ApiError} - Throws an ApiError if authentication fails (e.g., invalid credentials).
   */
  public async login(loginCredentials: LoginInput): Promise<IServiceResponse<ILoginResponseData>> {
    const { email, password } = loginCredentials;

    // Step 1: Find the user in the database by their email.
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // If no user is found with the provided email, throw an unauthorized error.
    // Using UNAUTHORIZED here helps prevent email enumeration attacks.
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    // Step 2: Compare the provided password with the hashed password stored in the database.
    // `bcrypt.compare` securely compares a plain-text password against a hash.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password does not match, throw an unauthorized error.
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    // Step 3: If authentication is successful, generate a JWT.
    // The JWT payload typically includes non-sensitive user information necessary for authorization.
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Payload: user ID, email, and role
      this.JWT_SECRET, // Secret key for signing the token
      { expiresIn: this.JWT_EXPIRES_IN } // Token expiration time (e.g., '1h', '7d')
    );

    // Prepare user data to be sent in the response (exclude the hashed password).
    const userDataForResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Return a successful ServiceResponse with the generated JWT and user data.
    return new ServiceResponse(
      StatusCodes.OK, // HTTP status code for successful login
      "Login successful",
      true, // Indicate success
      { token, user: userDataForResponse } // Data payload: token and user object
    );
  }
}

// Export an instance of the AuthService to be used by controllers.
export const authService = new AuthService();
