import {useRef, useEffect} from "react"
import * as d3 from "d3"
import {sankey, sankeyLinkHorizontal, sankeyLeft} from "d3-sankey"

// //using hardcoded data to test
// const HARDCODED = {
//   nodes: [
//       { name: 'Computer Science' },
//       { name: 'Business' },
//       { name: 'Software Engineer' },
//       { name: 'Data Analyst' },
//       { name: 'Product Manager' },
//       { name: 'Senior Engineer' },
//       { name: 'Data Scientist' },
//     ],
//     links: [
//       { source: 0, target: 2, value: 5 },
//       { source: 0, target: 3, value: 3 },
//       { source: 1, target: 3, value: 4 },
//       { source: 1, target: 4, value: 2 },
//       { source: 2, target: 5, value: 4 },
//       { source: 3, target: 6, value: 5 },
//     ]
// }

export default function SankeyDiagram({ data }){
  //D3 and react both want to control DOM, we use useRef hook to give D3 its DOM element which react wont touch
  const svgRef = useRef(null)

  useEffect(() => {
    if(!data){
      return //no data then return
    }

    const width = 1200
    const height = Math.max(500, data.nodes.length * 20)

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() //this clears everything before redrawing

    //this below sets the rectangular area for drawing where nodes and links will be laid out
    const sankeyLayout = sankey()
      .nodeId(node => node.name) //use name as id so string based source/target in links resolve correctly
      .nodeAlign(sankeyLeft) //force nodes to align left-to-right by connection depth
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[1, 1], [width - 1, height - 1]]) //we leave 1px marggin (-1) so elements i.e nodes dont touch svg edges

    const color = d3.scaleOrdinal()
      .domain([0, 1, 2])
      .range(['#4f46e5', '#7c3aed', '#a855f7'])
      
    const {nodes, links} = sankeyLayout({
      nodes: data.nodes.map(node => ({ ...node })), //this and below copies all array objects and make changes to them instead of real data
      links: data.links.map(link => ({ ...link })),
    })


    //drawing the links
    svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#aaa')
      .attr('stroke-width', link => Math.max(1, link.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)

    //drawing nodes
    svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', node => node.x0)
      .attr('y', node => node.y0)
      .attr('width', node => node.x1 - node.x0)
      .attr('height', node => node.y1 - node.y0)
      .attr('fill', node => color(node.depth))
      .style('cursor', 'pointer')
      .on('click', (event, node) => {
        svg.selectAll('path')
          .attr('opacity', link => (link.source === node || link.target === node) ? 0.8 : 0.1)
      })
      .on('mouseover', (event, node) => {                                                                                                                                   
        d3.select('#tooltip')
          .style('opacity', 1)
          .html(`<strong>${node.name}</strong><br/>Alumni: ${Math.round(node.value)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
      })
      .on('mouseout', () => {
        d3.select('#tooltip').style('opacity', 0)
      })
    
    // drawing  labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', node => node.x0 < width / 2 ? node.x1 + 6 : node.x0 - 6)
      .attr('y', node => (node.y0 + node.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', node => node.x0 < width / 2 ? 'start' : 'end')
      .text(node => node.name)
      .attr('font-size', 12)

  }, [data])

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={1200} height={Math.max(500, (data?.nodes?.length ?? 0) * 20)} />
      <div
        id="tooltip"
        style={{
          position: 'absolute',
          opacity: 0,
          background: '#1e1b4b',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
        }}
      />
    </div>
  )

}


