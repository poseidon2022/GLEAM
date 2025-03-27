#include "HBM3Bank.h"

HBM3Bank::HBM3Bank(int num_rows, int words_per_row, int bandwidth, int read_ns, int write_ns)
    : rows(num_rows), words_per_row(words_per_row), bandwidth(bandwidth), read_latency(read_ns), write_latency(write_ns) {
    bank.resize(rows, std::vector<float>(words_per_row, 0));
}

void HBM3Bank::writeFeature(int start_row, const std::vector<float>& feature) {
    int total_size = feature.size();
    int current_idx = 0;

    for (int row = start_row; row < rows && current_idx < total_size; ++row) {
        for (int col = 0; col < words_per_row && current_idx < total_size; ++col) {
            bank[row][col] = feature[current_idx++];
            std::this_thread::sleep_for(std::chrono::nanoseconds(write_latency));
        }
    }
    std::cout << "Feature written starting at row " << start_row << "\n";
}

std::vector<float> HBM3Bank::readFeature(int start_row, int feature_size) {
    std::vector<float> feature;
    int current_idx = 0;

    for (int row = start_row; row < rows && current_idx < feature_size; ++row) {
        for (int col = 0; col < words_per_row && current_idx < feature_size; ++col) {
            feature.push_back(bank[row][col]);
            current_idx++;

            if (current_idx % bandwidth == 0) {
                std::this_thread::sleep_for(std::chrono::nanoseconds(read_latency));
            }
        }
    }
    std::cout << "Feature read starting from row " << start_row << "\n";
    return feature;
}
