import sys
import os
import unittest
import pytest
import numpy as np

# Add parent directory to path to import from modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from power_grid.grid import Node, Line, PowerGrid


class TestNode(unittest.TestCase):
    """Tests for the Node class in the power grid module."""
    
    def test_node_creation(self):
        """Test that a node can be created with valid parameters."""
        node = Node("N1", 230.0)
        self.assertEqual(node.node_id, "N1")
        self.assertEqual(node.voltage, 230.0)
    
    def test_negative_voltage_raises_error(self):
        """Test that creating a node with negative voltage raises ValueError."""
        with self.assertRaises(ValueError):
            Node("N1", -10.0)
    
    def test_set_voltage(self):
        """Test that voltage can be set to a valid value."""
        node = Node("N1", 230.0)
        node.set_voltage(240.0)
        self.assertEqual(node.voltage, 240.0)
    
    def test_set_negative_voltage_raises_error(self):
        """Test that setting voltage to a negative value raises ValueError."""
        node = Node("N1", 230.0)
        with self.assertRaises(ValueError):
            node.set_voltage(-10.0)


class TestLine(unittest.TestCase):
    """Tests for the Line class in the power grid module."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.node1 = Node("N1", 230.0)
        self.node2 = Node("N2", 115.0)
    
    def test_line_creation(self):
        """Test that a line can be created with valid parameters."""
        line = Line("L1", self.node1, self.node2, 10.0)
        self.assertEqual(line.line_id, "L1")
        self.assertEqual(line.from_node, self.node1)
        self.assertEqual(line.to_node, self.node2)
        self.assertEqual(line.resistance, 10.0)
    
    def test_zero_resistance_raises_error(self):
        """Test that creating a line with zero resistance raises ValueError."""
        with self.assertRaises(ValueError):
            Line("L1", self.node1, self.node2, 0.0)
    
    def test_negative_resistance_raises_error(self):
        """Test that creating a line with negative resistance raises ValueError."""
        with self.assertRaises(ValueError):
            Line("L1", self.node1, self.node2, -5.0)
    
    def test_calculate_current(self):
        """Test the calculation of current through a line."""
        line = Line("L1", self.node1, self.node2, 10.0)
        # Using Ohm's Law: I = V/R = (230 - 115) / 10 = 11.5
        expected_current = (230.0 - 115.0) / 10.0
        self.assertEqual(line.calculate_current(), expected_current)


class TestPowerGrid(unittest.TestCase):
    """Tests for the PowerGrid class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.grid = PowerGrid()
        self.node1 = Node("N1", 230.0)
        self.node2 = Node("N2", 115.0)
        self.node3 = Node("N3", 0.0)
    
    def test_add_and_get_node(self):
        """Test that nodes can be added to and retrieved from the grid."""
        self.grid.add_node(self.node1)
        retrieved_node = self.grid.get_node("N1")
        self.assertEqual(retrieved_node, self.node1)
    
    def test_add_duplicate_node_raises_error(self):
        """Test that adding a node with a duplicate ID raises ValueError."""
        self.grid.add_node(self.node1)
        with self.assertRaises(ValueError):
            self.grid.add_node(self.node1)
    
    def test_add_and_get_line(self):
        """Test that lines can be added to and retrieved from the grid."""
        self.grid.add_node(self.node1)
        self.grid.add_node(self.node2)
        
        line = Line("L1", self.node1, self.node2, 10.0)
        self.grid.add_line(line)
        
        retrieved_line = self.grid.get_line("L1")
        self.assertEqual(retrieved_line, line)
    
    def test_add_line_with_missing_nodes_raises_error(self):
        """Test that adding a line with nodes not in the grid raises ValueError."""
        line = Line("L1", self.node1, self.node2, 10.0)
        with self.assertRaises(ValueError):
            self.grid.add_line(line)
    
    def test_calculate_all_currents(self):
        """Test the calculation of currents for all lines in the grid."""
        # Add nodes
        self.grid.add_node(self.node1)
        self.grid.add_node(self.node2)
        self.grid.add_node(self.node3)
        
        # Add lines
        line1 = Line("L1", self.node1, self.node2, 10.0)
        line2 = Line("L2", self.node2, self.node3, 5.0)
        self.grid.add_line(line1)
        self.grid.add_line(line2)
        
        # Calculate currents
        currents = self.grid.calculate_all_currents()
        
        # Expected currents using Ohm's Law
        expected_current1 = (230.0 - 115.0) / 10.0  # (230V - 115V) / 10Ω = 11.5A
        expected_current2 = (115.0 - 0.0) / 5.0     # (115V - 0V) / 5Ω = 23.0A
        
        self.assertEqual(currents["L1"], expected_current1)
        self.assertEqual(currents["L2"], expected_current2)
    
    def test_validate_grid_with_valid_grid(self):
        """Test grid validation with a valid grid configuration."""
        # Add nodes
        self.grid.add_node(self.node1)
        self.grid.add_node(self.node2)
        
        # Add line connecting the nodes
        line = Line("L1", self.node1, self.node2, 10.0)
        self.grid.add_line(line)
        
        errors = self.grid.validate_grid()
        self.assertEqual(len(errors), 0)
    
    def test_validate_grid_with_isolated_node(self):
        """Test grid validation with an isolated node."""
        # Add nodes
        self.grid.add_node(self.node1)
        self.grid.add_node(self.node2)
        self.grid.add_node(self.node3)
        
        # Add line connecting only two nodes
        line = Line("L1", self.node1, self.node2, 10.0)
        self.grid.add_line(line)
        
        errors = self.grid.validate_grid()
        self.assertEqual(len(errors), 1)  # One error for the isolated node
        self.assertIn("is isolated", errors[0])


if __name__ == "__main__":
    unittest.main() 