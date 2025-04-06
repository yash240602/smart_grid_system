import { useRef, useEffect, useState, useCallback, memo } from 'react'
import * as d3 from 'd3'
import './GridGraph.css'

interface Node {
  id: string
  voltage: number
  fixed?: boolean
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  id: string
  source: string | Node
  target: string | Node
  resistance: number
  current?: number
}

interface GridGraphProps {
  nodes: Node[]
  links: Link[]
  anomalies?: string[]
  onNodeClick?: (nodeId: string) => void
}

// Voltage color scale
const voltageColorScale = d3.scaleLinear<string>()
  .domain([0, 115, 230])
  .range(['#f39c12', '#2ecc71', '#3498db'])

// Optimize with memoization to prevent unnecessary re-renders
const GridGraph: React.FC<GridGraphProps> = memo(({ nodes, links, anomalies = [], onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  // Add a tooltip reference to track the DOM element
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
  // Handle window resize with throttling
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }
    
    // Initial size calculation
    handleResize()
    
    // Set up throttled resize listener
    let resizeTimeout: number | null = null;
    const throttledResize = () => {
      if (!resizeTimeout) {
        resizeTimeout = window.setTimeout(() => {
          resizeTimeout = null;
          handleResize();
        }, 200);
      }
    };
    
    window.addEventListener('resize', throttledResize)
    
    return () => {
      window.removeEventListener('resize', throttledResize)
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
    }
  }, [])
  
  // Drag behavior defined outside the main effect for reuse and better performance
  const dragFunction = useCallback((simulation: d3.Simulation<Node, undefined>) => {
    return d3.drag<SVGCircleElement, Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        if (!d.fixed) {
          d.fx = null
          d.fy = null
        }
      })
  }, [])
  
  // Create and update the force-directed graph
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || links.length === 0) return
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()
    
    // Create tooltip if it doesn't exist yet
    if (!tooltipRef.current) {
      const tooltipElement = document.createElement('div');
      tooltipElement.className = 'graph-tooltip';
      tooltipElement.style.opacity = '0';
      tooltipElement.style.position = 'absolute';
      tooltipElement.style.pointerEvents = 'none';
      document.body.appendChild(tooltipElement);
      tooltipRef.current = tooltipElement;
    }
    
    const svg = d3.select(svgRef.current)
    const width = dimensions.width
    const height = dimensions.height
    
    // Setup zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)
    
    // Create a container for all graph elements
    const g = svg.append('g')
    
    // Prepare data for simulation - use a more efficient approach
    const nodeById = new Map(nodes.map(node => [node.id, node]))
    const linkData = links.map(link => {
      // Pre-resolve source and target references for better performance
      const source = typeof link.source === 'string' ? nodeById.get(link.source) : link.source
      const target = typeof link.target === 'string' ? nodeById.get(link.target) : link.target
      return { ...link, source, target }
    })
    
    // Force simulation with optimized settings
    simulationRef.current = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, d3.SimulationLinkDatum<Node>>(linkData as any)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(300))  // Limit the distance for better performance
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.02)  // Quicker stabilization
    
    // Link elements - first so they are below nodes
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', (d: any) => Math.max(1, d.current ? Math.sqrt(d.current) : 1))
      .attr('stroke', '#999')
    
    // Reduce the number of animated current particles for better performance
    const currentLinks = links.filter((l: any) => l.current && l.current > 0);
    // Only animate at most 15 links to avoid performance issues
    const limitedCurrentLinks = currentLinks.length > 15 
      ? currentLinks.sort((a: any, b: any) => b.current - a.current).slice(0, 15) 
      : currentLinks;
    
    // Current flow animation for links - with reduced particles
    g.append('g')
      .attr('class', 'link-animations')
      .selectAll('circle')
      .data(limitedCurrentLinks)
      .enter()
      .append('circle')
      .attr('class', 'current-particle')
      .attr('r', 3)
      .attr('fill', '#3498db')
      .each(function(d) {
        d3.select(this)
          .datum({ link: d, position: Math.random() }) // Stagger starting positions
      })
    
    // Node elements
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', d => `node ${anomalies.includes(d.id) ? 'anomaly' : ''}`)
      .attr('r', 10)
      .attr('fill', d => voltageColorScale(d.voltage))
      .call(dragFunction(simulationRef.current))
      .on('click', function(_event, d) {
        if (onNodeClick) onNodeClick(d.id)
      })
    
    // Node labels - only show when node count is manageable
    if (nodes.length <= 50) {
      g.append('g')
        .attr('class', 'node-labels')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'node-label')
        .attr('dy', -15)
        .attr('text-anchor', 'middle')
        .text(d => `${d.id}: ${d.voltage}V`)
    }
    
    link
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('stroke-width', () => Math.max(3, d.current ? Math.sqrt(d.current) * 1.5 : 3))
          .attr('stroke', '#555');
          
        // Use direct DOM manipulation for the tooltip
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `Line: ${d.id}<br/>Resistance: ${d.resistance} Ω<br/>Current: ${d.current ? d.current.toFixed(2) + ' A' : 'N/A'}`;
          tooltipRef.current.style.opacity = '1';
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY - 28}px`;
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', (d: any) => Math.max(1, d.current ? Math.sqrt(d.current) : 1))
          .attr('stroke', '#999');
          
        // Hide tooltip
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      });
    
    // Use requestAnimationFrame for smoother animations
    let animationFrameId: number;
    let lastTickTime = performance.now();
    
    const animate = () => {
      const now = performance.now();
      // Only update particle animations every ~30ms for better performance
      if (now - lastTickTime >= 30) {
        g.selectAll('.current-particle')
          .each(function(d: any) {
            d.position = (d.position + 0.03) % 1;
            const sourceX = (d.link.source as any).x;
            const sourceY = (d.link.source as any).y;
            const targetX = (d.link.target as any).x;
            const targetY = (d.link.target as any).y;
            
            const x = sourceX + (targetX - sourceX) * d.position;
            const y = sourceY + (targetY - sourceY) * d.position;
            
            d3.select(this)
              .attr('cx', x)
              .attr('cy', y);
          });
        lastTickTime = now;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    simulationRef.current.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y)
      
      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
      
      // Update node labels if they exist
      g.selectAll('.node-label')
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y)
    });
    
    // Start animation loop
    animate();
    
    // Set fixed positions for nodes that should be fixed
    nodes.forEach(node => {
      if (node.fixed && node.x && node.y) {
        node.fx = node.x
        node.fy = node.y
      }
    })
    
    // Increase stability by running simulation for a bit and then stopping
    simulationRef.current.tick(100);
    
    // Cleanup
    return () => {
      if (simulationRef.current) simulationRef.current.stop()
      cancelAnimationFrame(animationFrameId);
      
      // Remove tooltip when component unmounts
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    }
  }, [nodes, links, anomalies, dimensions, onNodeClick, dragFunction])
  
  return (
    <div className="grid-graph-container">
      <svg 
        ref={svgRef} 
        className="grid-graph" 
        width="100%" 
        height="100%"
      />
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: voltageColorScale(0) }}></div>
          <span>0V</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: voltageColorScale(115) }}></div>
          <span>115V</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: voltageColorScale(230) }}></div>
          <span>230V</span>
        </div>
        {anomalies.length > 0 && (
          <div className="legend-item">
            <div className="legend-color anomaly"></div>
            <span>Anomaly</span>
          </div>
        )}
      </div>
    </div>
  )
});

export default GridGraph 