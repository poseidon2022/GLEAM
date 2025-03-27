#ifndef HBM3BANK_H
#define HBM3BANK_H

#include <vector>
#include <iostream>
#include <thread>
#include <chrono>

class HBM3Bank {
    private:
        std::vector<std::vector<float>> bank;
        int rows, words_per_row;
        int bandwidth;
        int read_latency, write_latency;

    public:
        HBM3Bank(int num_rows, int words_per_row, int bandwidth = 8, int read_ns = 2, int write_ns = 3);
        void writeFeature(int start_row, const std::vector<float>& feature);
        std::vector<float> readFeature(int start_row, int feature_size);
};

#endif
