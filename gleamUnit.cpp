#include "HBM3Bank.h"
#include <vector>
#include <iostream>

#define VECTOR_SIZE 10 

using FeatureVector = std::vector<float>;

class GLEAM {
private:
    HBM3Bank& bank; 
    FeatureVector row_buffer;
    bool control_bit;

public:
    GLEAM(HBM3Bank& bank, bool ctrl_bit) 
        : bank(bank), row_buffer(VECTOR_SIZE, 0.0f), control_bit(ctrl_bit) {}

    FeatureVector multiply(float weight, const FeatureVector& features) {
        FeatureVector result(VECTOR_SIZE); 
        for (int i = 0; i < VECTOR_SIZE; ++i) {
            result[i] = weight * features[i];
        }
        return result;
    }

    FeatureVector aggregate(const FeatureVector& acc, const FeatureVector& new_val) {
        FeatureVector result(VECTOR_SIZE);
        if (control_bit == 0) { 
            for (int i = 0; i < VECTOR_SIZE; ++i) {
                result[i] = acc[i] + new_val[i];
            }
        } else { 
            for (int i = 0; i < VECTOR_SIZE; ++i) {
                result[i] = std::max(acc[i], new_val[i]);
            }
        }
        return result;
    }

    void process_node(int node_id, const std::vector<int>& neighbors, const std::vector<float>& weights) {
        FeatureVector accumulator(VECTOR_SIZE, 0.0f);

        for (size_t i = 0; i < neighbors.size(); ++i) {
            int neighbor_id = neighbors[i];
            float weight = weights[i];

            FeatureVector neighbor_features = bank.readFeature(neighbor_id, VECTOR_SIZE);
            FeatureVector weighted_features = multiply(weight, neighbor_features);
            accumulator = aggregate(accumulator, weighted_features);
        }

        row_buffer = accumulator;
    }

    FeatureVector get_result() const {
        return row_buffer;
    }
}; 

void run_test() {
    HBM3Bank memory(16, 8); 

    FeatureVector firstNeighborFeature = {1.1f, 2.2f, 3.3f, 4.4f, 5.5f, 6.6f, 7.7f, 8.8f, 9.9f, 10.1f};
    FeatureVector secondNeighborFeature = {1.1f, 2.2f, 3.3f, 4.4f, 5.5f, 6.6f, 7.7f, 8.8f, 9.9f, 10.1f};

    memory.writeFeature(2, firstNeighborFeature);
    memory.writeFeature(5, secondNeighborFeature);

    GLEAM gleam_sum(memory, 0);
    std::vector<int> neighbors = {2, 5}; // Here we pass in the start_row for each neighbor of the node
    std::vector<float> weights = {0.8f, 0.5f};
    gleam_sum.process_node(0, neighbors, weights);

    std::cout << "Test 1: Summation Result\n"; 
    FeatureVector result_sum = gleam_sum.get_result();
    for (float val : result_sum) {
        std::cout << val << " ";
    }
    std::cout << "\n";

    // Test 2: Comparison (max) (control_bit = 1)
    GLEAM gleam_max(memory, 1);
    gleam_max.process_node(0, neighbors, weights);

    std::cout << "\nTest 2: Comparison (Max) Result\n";
    FeatureVector result_max = gleam_max.get_result();
    for (float val : result_max) {
        std::cout << val << " ";
    }
    std::cout << "\n";
}

int main() {
    run_test();
    return 0;
}