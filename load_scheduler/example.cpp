#include "scheduler.hpp"
#include <iostream>
#include <thread>
#include <chrono>
#include <vector>

/**
 * This example demonstrates the thread-safe load scheduler for power grid management.
 * It simulates a scenario where different loads with different priorities are added
 * to the scheduler, and then processed based on their priority.
 */

// Function to simulate processing a load
void processLoad(const std::shared_ptr<smart_grid::Load>& load) {
    std::cout << "Processing load " << load->getId() 
              << " with power requirement " << load->getPowerRequirement() 
              << "W and priority " << load->getPriority() << std::endl;
    
    // Simulate processing time proportional to power requirement
    std::this_thread::sleep_for(std::chrono::milliseconds(
        static_cast<int>(load->getPowerRequirement() / 100)));
}

// Function to run in a thread that adds loads to the scheduler
void addLoadsToScheduler(smart_grid::LoadScheduler& scheduler) {
    // Create some loads with different priorities
    std::vector<std::shared_ptr<smart_grid::Load>> loads = {
        std::make_shared<smart_grid::Load>("Hospital", 5000.0, 1),   // Highest priority
        std::make_shared<smart_grid::Load>("School", 2000.0, 3),
        std::make_shared<smart_grid::Load>("Factory", 8000.0, 2),
        std::make_shared<smart_grid::Load>("Residential", 1500.0, 4) // Lowest priority
    };
    
    // Add loads to the scheduler
    for (const auto& load : loads) {
        std::cout << "Adding load " << load->getId() << " to scheduler" << std::endl;
        if (scheduler.addLoad(load)) {
            std::cout << "  Load " << load->getId() << " added successfully" << std::endl;
        } else {
            std::cout << "  Failed to add load " << load->getId() << std::endl;
        }
        
        // Small delay between additions
        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }
}

// Function to run in a thread that processes loads from the scheduler
void processLoadsFromScheduler(smart_grid::LoadScheduler& scheduler) {
    // Wait a bit to allow some loads to be added first
    std::this_thread::sleep_for(std::chrono::seconds(1));
    
    // Process loads until scheduler is empty
    while (!scheduler.empty()) {
        // Get the highest priority load
        auto top_load = scheduler.popTopLoad();
        
        if (top_load) {
            processLoad(top_load);
        } else {
            // Should not happen since we checked empty(), but just in case
            std::cout << "No load available to process" << std::endl;
            break;
        }
        
        // Small delay between processing
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
    
    std::cout << "All loads processed" << std::endl;
}

// Function to demonstrate dynamic priority adjustment
void adjustPriorities(smart_grid::LoadScheduler& scheduler) {
    // Wait a bit to allow some loads to be added first
    std::this_thread::sleep_for(std::chrono::seconds(2));
    
    // Simulate an emergency by raising the priority of a residential area
    if (scheduler.updatePriority("Residential", 1)) {
        std::cout << "EMERGENCY: Residential area priority updated to 1 (highest)" << std::endl;
    } else {
        std::cout << "Failed to update Residential priority (may have been processed already)" << std::endl;
    }
}

int main() {
    std::cout << "=== Smart Grid Load Scheduler Example ===" << std::endl;
    
    // Create the load scheduler
    smart_grid::LoadScheduler scheduler;
    
    // Start threads for different operations
    std::thread add_thread(addLoadsToScheduler, std::ref(scheduler));
    std::thread process_thread(processLoadsFromScheduler, std::ref(scheduler));
    std::thread adjust_thread(adjustPriorities, std::ref(scheduler));
    
    // Wait for all threads to complete
    add_thread.join();
    adjust_thread.join();
    process_thread.join();
    
    std::cout << "=== Example completed ===" << std::endl;
    return 0;
} 