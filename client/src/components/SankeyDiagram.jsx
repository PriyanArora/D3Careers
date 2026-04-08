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
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)

  const nodeCount = data?.nodes?.length ?? 0
  const labelOffset = 8

  const measureMaxLabelWidth = (nodes) => {
    if (!nodes?.length) {
      return 120
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      return 160
    }

    context.font = "600 13px Inter, sans-serif"

    return nodes.reduce((max, node) => {
      const label = node?.name ?? ''
      return Math.max(max, context.measureText(label).width)
    }, 0)
  }

  const maxLabelWidth = measureMaxLabelWidth(data?.nodes)

  const frameTop = 24
  const frameRight = 16
  const frameBottom = 24
  const frameLeft = 16
  const layoutWidth = 1180
  const chartWidth = Math.ceil(frameLeft + layoutWidth + labelOffset + maxLabelWidth + frameRight)
  const height = Math.max(520, nodeCount * 22) + frameTop + frameBottom

  useEffect(() => {
    if(!data){
      return //no data then return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() //this clears everything before redrawing
    svg.style('overflow', 'visible')

    const placeTooltipAboveCursor = (event, node) => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) {
        return
      }

      const rawLeft = event.clientX - containerRect.left
      const rawTop = event.clientY - containerRect.top - 12
      const clampedLeft = Math.min(Math.max(rawLeft, 90), containerRect.width - 90)
      const clampedTop = Math.max(rawTop, 40)

      d3.select(tooltipRef.current)
        .style('opacity', 1)
        .html(`<strong>${node.name}</strong><br/>Alumni: ${Math.round(node.value)}`)
        .style('left', `${clampedLeft}px`)
        .style('top', `${clampedTop}px`)
        .style('transform', 'translate(-50%, -100%)')
    }

    //this below sets the rectangular area for drawing where nodes and links will be laid out
    const sankeyLayout = sankey()
      .nodeId(node => node.name) //use name as id so string based source/target in links resolve correctly
      .nodeAlign(sankeyLeft) //force nodes to align left-to-right by connection depth
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[frameLeft, frameTop], [frameLeft + layoutWidth - 1, height - frameBottom]])

    const color = d3.scaleOrdinal()
      .domain([0, 1, 2])
      .range(['#f7de5a', '#f8d6b3', '#dff5ef'])
      
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
        placeTooltipAboveCursor(event, node)
      })
      .on('mousemove', (event, node) => {
        placeTooltipAboveCursor(event, node)
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current).style('opacity', 0)
      })
    
    // drawing  labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
        .attr('x', node => node.x1 + labelOffset)
      .attr('y', node => (node.y0 + node.y1) / 2)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'start')
      .text(node => node.name)
      .attr('fill', '#000')
      .attr('font-size', 13)
      .attr('font-weight', 600)

      }, [chartWidth, data, frameBottom, frameLeft, frameTop, height, labelOffset, layoutWidth])

  return (
        <div ref={containerRef} className="relative overflow-hidden rounded-3xl border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_#000] sm:p-6">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${height}`}
            preserveAspectRatio="xMinYMin meet"
            className="block h-auto w-full"
          />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-20 rounded-md border-2 border-black bg-[#111111] px-3 py-2 text-xs text-white opacity-0"
      />
    </div>
  )

}


