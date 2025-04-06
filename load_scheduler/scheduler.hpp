#pragma once

#include <queue>
#include <vector>
#include <string>
#include <unordered_map>
#include <mutex>
#include <algorithm>
#include <iostream>
#include <memory>
#include <functional>

namespace smart_grid {

/**
 * @class Load
 * @brief Represents an electrical load in the power grid
 * 
 * In electrical engineering, a load is an electrical component that consumes power.
 * Loads can have different priorities based on their importance in the grid.
 */
class Load {
public:
    /**
     * @brief Construct a new Load object
     * 
     * @param id Unique identifier for the load
     * @param power_requirement Power required by the load in Watts
     * @param initial_priority Initial priority value (lower value means higher priority)
     */
    Load(const std::string& id, double power_requirement, int initial_priority)
        : id_(id), power_requirement_(power_requirement), priority_(initial_priority) {
        
        if (power_requirement <= 0) {
            throw std::invalid_argument("Power requirement must be positive");
        }
    }

    // Getters
    const std::string& getId() const { return id_; }
    double getPowerRequirement() const { return power_requirement_; }
    int getPriority() const { return priority_; }

    /**
     * @brief Set the priority value of this load
     * 
     * @param priority New priority value (lower values have higher priority)
     */
    void setPriority(int priority) { priority_ = priority; }

private:
    std::string id_;              ///< Unique identifier for the load
    double power_requirement_;    ///< Power required by the load in Watts
    int priority_;                ///< Priority value (lower value means higher priority)
};

/**
 * @brief Comparison function for Load objects in priority queue
 */
struct LoadComparator {
    bool operator()(const std::shared_ptr<Load>& a, const std::shared_ptr<Load>& b) const {
        // Lower priority value means higher priority
        return a->getPriority() > b->getPriority();
    }
};

/**
 * @class LoadScheduler
 * @brief Thread-safe priority queue for scheduling electrical loads
 * 
 * Implements a thread-safe priority queue that schedules loads based on their
 * priority. Supports dynamic priority adjustment with O(n) update capability.
 */
class LoadScheduler {
public:
    LoadScheduler() = default;
    
    /**
     * @brief Add a load to the scheduler
     * 
     * @param load Shared pointer to the load to add
     * @return true if the load was added successfully, false if a load with the same ID already exists
     */
    bool addLoad(std::shared_ptr<Load> load) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Check if a load with this ID already exists
        if (load_map_.find(load->getId()) != load_map_.end()) {
            return false;
        }
        
        // Add the load to the map and priority queue
        load_map_[load->getId()] = load;
        load_queue_.push(load);
        return true;
    }
    
    /**
     * @brief Remove a load from the scheduler
     * 
     * @param load_id ID of the load to remove
     * @return true if the load was removed, false if it wasn't found
     */
    bool removeLoad(const std::string& load_id) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = load_map_.find(load_id);
        if (it == load_map_.end()) {
            return false;
        }
        
        // Remove from map
        load_map_.erase(it);
        
        // Need to rebuild queue as std::priority_queue doesn't support removal
        rebuildQueue();
        return true;
    }
    
    /**
     * @brief Update the priority of a load
     * 
     * @param load_id ID of the load to update
     * @param new_priority New priority value
     * @return true if the load was found and updated, false otherwise
     */
    bool updatePriority(const std::string& load_id, int new_priority) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = load_map_.find(load_id);
        if (it == load_map_.end()) {
            return false;
        }
        
        // Update priority in the Load object
        it->second->setPriority(new_priority);
        
        // Need to rebuild queue as std::priority_queue doesn't maintain heap property
        // after updating an element
        rebuildQueue();
        return true;
    }
    
    /**
     * @brief Get the highest priority load without removing it
     * 
     * @return std::shared_ptr<Load> to the highest priority load, or nullptr if queue is empty
     */
    std::shared_ptr<Load> peekTopLoad() {
        std::lock_guard<std::mutex> lock(mutex_);
        
        if (load_queue_.empty()) {
            return nullptr;
        }
        
        return load_queue_.top();
    }
    
    /**
     * @brief Get and remove the highest priority load
     * 
     * @return std::shared_ptr<Load> to the highest priority load, or nullptr if queue is empty
     */
    std::shared_ptr<Load> popTopLoad() {
        std::lock_guard<std::mutex> lock(mutex_);
        
        if (load_queue_.empty()) {
            return nullptr;
        }
        
        std::shared_ptr<Load> top_load = load_queue_.top();
        load_queue_.pop();
        load_map_.erase(top_load->getId());
        
        return top_load;
    }
    
    /**
     * @brief Get a load by its ID
     * 
     * @param load_id ID of the load to find
     * @return std::shared_ptr<Load> to the load if found, nullptr otherwise
     */
    std::shared_ptr<Load> getLoadById(const std::string& load_id) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto it = load_map_.find(load_id);
        if (it == load_map_.end()) {
            return nullptr;
        }
        
        return it->second;
    }
    
    /**
     * @brief Get the number of loads in the scheduler
     * 
     * @return size_t Number of loads
     */
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return load_queue_.size();
    }
    
    /**
     * @brief Check if the scheduler is empty
     * 
     * @return true if empty, false otherwise
     */
    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return load_queue_.empty();
    }

private:
    /**
     * @brief Rebuild the priority queue after modifications
     * 
     * This is an O(n) operation required after changing priorities or removing elements
     */
    void rebuildQueue() {
        // Create a new queue with the updated elements
        std::priority_queue<std::shared_ptr<Load>, 
                            std::vector<std::shared_ptr<Load>>, 
                            LoadComparator> new_queue;
        
        for (const auto& pair : load_map_) {
            new_queue.push(pair.second);
        }
        
        // Swap with the old queue
        load_queue_.swap(new_queue);
    }

    // Thread synchronization
    mutable std::mutex mutex_;
    
    // Data structures
    std::priority_queue<std::shared_ptr<Load>, 
                         std::vector<std::shared_ptr<Load>>, 
                         LoadComparator> load_queue_;
    std::unordered_map<std::string, std::shared_ptr<Load>> load_map_;
};

} // namespace smart_grid 