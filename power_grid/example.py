#!/usr/bin/env python3
"""
Example usage of the power grid simulation module.

This example creates a simple 3-node, 2-line grid configuration and demonstrates
basic operations such as calculating currents and validating the grid.
"""

from grid import Node, Line, PowerGrid


def main():
    """Create and demonstrate a simple power grid."""
    # Create a power grid
    grid = PowerGrid()
    
    # Create nodes with different voltages
    node1 = Node("N1", 230.0)  # 230V source node (typical domestic voltage in India)
    node2 = Node("N2", 115.0)  # 115V intermediate node
    node3 = Node("N3", 0.0)    # 0V ground node
    
    # Add nodes to the grid
    grid.add_node(node1)
    grid.add_node(node2)
    grid.add_node(node3)
    
    # Create transmission lines with different resistances
    line1 = Line("L1", node1, node2, 10.0)  # 10 ohm line between nodes 1 and 2
    line2 = Line("L2", node2, node3, 5.0)   # 5 ohm line between nodes 2 and 3
    
    # Add lines to the grid
    grid.add_line(line1)
    grid.add_line(line2)
    
    # Calculate current in a specific line
    current_l1 = line1.calculate_current()
    print(f"Current in line L1: {current_l1:.2f} A")
    
    # Batch calculate currents in all lines
    all_currents = grid.calculate_all_currents()
    print("\nAll currents in the grid:")
    for line_id, current in all_currents.items():
        print(f"  Line {line_id}: {current:.2f} A")
    
    # Validate the grid
    validation_errors = grid.validate_grid()
    if validation_errors:
        print("\nGrid validation errors:")
        for error in validation_errors:
            print(f"  - {error}")
    else:
        print("\nGrid is valid.")
    
    # Demonstrate value validation
    print("\nDemonstrating validation:")
    try:
        node1.set_voltage(-10.0)  # Should raise ValueError due to negative voltage
    except ValueError as e:
        print(f"  Validation error: {e}")
    
    try:
        line1.set_resistance(0.0)  # Should raise ValueError due to zero resistance
    except ValueError as e:
        print(f"  Validation error: {e}")


if __name__ == "__main__":
    main() 