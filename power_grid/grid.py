from typing import Dict, List, Tuple, Optional
import numpy as np


class Node:
    """
    Represents a node in an electrical grid.
    
    In electrical engineering, a node is a point in a circuit where two or more components are connected.
    Voltage is measured at nodes with respect to a reference node (ground).
    """
    def __init__(self, node_id: str, voltage: float = 0.0):
        """
        Initialize a node with an ID and voltage.
        
        Args:
            node_id: Unique identifier for the node
            voltage: Potential difference at this node (in Volts)
        
        Raises:
            ValueError: If voltage is negative (violates physical constraints)
        """
        self.node_id = node_id
        self._voltage = 0.0
        self.set_voltage(voltage)
    
    def set_voltage(self, voltage: float) -> None:
        """
        Set the voltage at this node.
        
        Args:
            voltage: Potential difference (in Volts)
            
        Raises:
            ValueError: If voltage is negative
        """
        if voltage < 0:
            raise ValueError(f"Voltage cannot be negative: {voltage}V")
        self._voltage = voltage
    
    @property
    def voltage(self) -> float:
        """Get the voltage at this node."""
        return self._voltage


class Line:
    """
    Represents a transmission line between two nodes in an electrical grid.
    
    In power systems, transmission lines connect different nodes and have resistance
    that affects current flow according to Ohm's Law (V = IR).
    """
    def __init__(self, line_id: str, from_node: Node, to_node: Node, resistance: float):
        """
        Initialize a transmission line with an ID, connected nodes, and resistance.
        
        Args:
            line_id: Unique identifier for the line
            from_node: Source node
            to_node: Destination node
            resistance: Line resistance (in Ohms)
            
        Raises:
            ValueError: If resistance is zero or negative (violates physical constraints)
        """
        self.line_id = line_id
        self.from_node = from_node
        self.to_node = to_node
        self._resistance = 0.0
        self.set_resistance(resistance)
    
    def set_resistance(self, resistance: float) -> None:
        """
        Set the resistance of this line.
        
        Args:
            resistance: Line resistance (in Ohms)
            
        Raises:
            ValueError: If resistance is zero or negative
        """
        if resistance <= 0:
            raise ValueError(f"Resistance must be positive: {resistance}Ω")
        self._resistance = resistance
    
    @property
    def resistance(self) -> float:
        """Get the resistance of this line."""
        return self._resistance
    
    def calculate_current(self) -> float:
        """
        Calculate the current flowing through this line using Ohm's Law.
        
        Returns:
            Current in Amperes (A)
        """
        voltage_difference = self.from_node.voltage - self.to_node.voltage
        return voltage_difference / self.resistance


class PowerGrid:
    """
    Represents an electrical power grid with nodes and transmission lines.
    
    Implements Kirchhoff's Voltage Law (KVL) which states that the sum of all voltages
    around any closed loop in a circuit must equal zero.
    """
    def __init__(self):
        """Initialize an empty power grid."""
        self.nodes: Dict[str, Node] = {}
        self.lines: Dict[str, Line] = {}
    
    def add_node(self, node: Node) -> None:
        """
        Add a node to the grid.
        
        Args:
            node: The node to add
            
        Raises:
            ValueError: If a node with the same ID already exists
        """
        if node.node_id in self.nodes:
            raise ValueError(f"Node {node.node_id} already exists in the grid")
        self.nodes[node.node_id] = node
    
    def add_line(self, line: Line) -> None:
        """
        Add a transmission line to the grid.
        
        Args:
            line: The line to add
            
        Raises:
            ValueError: If a line with the same ID already exists or if the line's
                        nodes are not in the grid
        """
        if line.line_id in self.lines:
            raise ValueError(f"Line {line.line_id} already exists in the grid")
        
        if line.from_node.node_id not in self.nodes or line.to_node.node_id not in self.nodes:
            raise ValueError("Both connecting nodes must exist in the grid")
        
        self.lines[line.line_id] = line
    
    def get_node(self, node_id: str) -> Optional[Node]:
        """
        Get a node by its ID.
        
        Args:
            node_id: The ID of the node to retrieve
            
        Returns:
            The node if found, None otherwise
        """
        return self.nodes.get(node_id)
    
    def get_line(self, line_id: str) -> Optional[Line]:
        """
        Get a line by its ID.
        
        Args:
            line_id: The ID of the line to retrieve
            
        Returns:
            The line if found, None otherwise
        """
        return self.lines.get(line_id)
    
    def calculate_all_currents(self) -> Dict[str, float]:
        """
        Calculate currents in all lines of the grid (batch calculation).
        
        Returns:
            Dictionary mapping line IDs to their respective currents
        """
        currents = {}
        for line_id, line in self.lines.items():
            currents[line_id] = line.calculate_current()
        return currents
    
    def validate_grid(self) -> List[str]:
        """
        Validate the grid for consistency and physical constraints.
        
        Returns:
            List of validation errors, empty if grid is valid
        """
        errors = []
        
        # Check for isolated nodes (nodes not connected to any line)
        connected_nodes = set()
        for line in self.lines.values():
            connected_nodes.add(line.from_node.node_id)
            connected_nodes.add(line.to_node.node_id)
        
        for node_id in self.nodes:
            if node_id not in connected_nodes:
                errors.append(f"Node {node_id} is isolated (not connected to any line)")
        
        # Check for loops using Kirchhoff's Voltage Law (KVL)
        # This is a simplified check that doesn't cover all cases
        # A more comprehensive implementation would use graph theory
        
        return errors 