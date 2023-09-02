import * as React from "react";
import SvgManager from "../../src/svg"
import CanvasManager from "../../src/canvas";
import Rect from "../../src/shape/rect";
import Text from "../../src/shape/text";

const toImgSrc = (svg: SVGSVGElement) => {
    // 这里一定要给svg设置这两个命名空间，包含了image 则也需要加上xmlns:xlink 否则浏览器会报错不能下载图片
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    // 这里用来解决当svg中图超出边界时，需要全部完整保存下来的功能
    let toExport = svg.cloneNode(true) as SVGSVGElement;
    // 转为base64 一定要加上unescape(encodeURIComponent，否则浏览器会报错
    return 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(toExport.outerHTML)))
}


export default function App() {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const gRef = React.useRef<SVGGElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    React.useEffect(() => {
        /* const m = new SvgManager({
             svg: svgRef.current!,
             viewport: gRef.current!,
             minScale: 0.2,
             maxScale: 4
         })
         m.startListening()
         m.translateBy(100, 100)*/

        const img = new Image()
        img.src = toImgSrc(svgRef.current!)
        img.onload = () => {
            const canvas = new CanvasManager({
                viewport: canvasRef.current!,
                minScale: 0.2,
                maxScale: 8,
            })
            const rect1 = new Rect({x: 0, y: 0, w: 200, h: 200})
            rect1.name = 'rect1'
            rect1.addEventListener('dragStart',(e)=>{
                console.log('dragStart1',e)

            })
            const rect2 = new Rect({x: 150, y: 150, w: 200, h: 200})
            rect2.addEventListener('dragStart',(e)=>{
                console.log('dragStart2',e)
                e.stopPropagation();
            })
            rect2.style.background = 'red'
            rect2.style.borderRadius = 100
            rect2.style.cursor = 'move'
            rect2.name = 'rect2';
            //rect2.rotate(90)
            //console.log(rect1, rect2);
            rect1.addChild(rect2)
            canvas.addView(rect1)
            //canvas.addView(rect2)
            console.log(rect1.getGroupMatrix());
            const text = new Text();
            text.text = '这是测试文字'
            //text.style.wrap = 'nowrap';
            text.style.color = 'red';
            text.style.cursor = 'pointer';
            text.maxWidth = 120
            canvas.addView(text)
            canvas.startListening()
        }

        return () => {
            //m.stopListening()
        }
    }, [])

    return (
        <div>
            <canvas width={500} height={500} ref={canvasRef}
                    style={{width: 500, height: 500, border: '1px solid red'}}/>
            <div
                style={
                    {
                        width: 500, height: 500, border: '1px solid red'
                    }
                }
                className="x6-graph x6-graph-pannable"
            >
                <div className="x6-graph-background"/>
                <div className="x6-graph-grid"/>
                <svg ref={svgRef} width="100%" height="100%" xmlnsXlink="http://www.w3.org/1999/xlink"
                     className="x6-graph-svg">
                    <defs>
                        <marker refX="-1" id="marker-v0-3764440138" overflow="visible" orient="auto"
                                markerUnits="userSpaceOnUse">
                            <path stroke="#333" fill="#333" transform="rotate(180)"
                                  d="M 0 0 L 10 -5 L 7.5 0 L 10 5 Z"/>
                        </marker>
                    </defs>
                    <g ref={gRef} className="x6-graph-svg-viewport">
                        <g className="x6-graph-svg-primer"/>
                        <g className="x6-graph-svg-stage">
                            <g
                                className="x6-cell x6-node" transform="translate(100,100)">
                                <rect fill="#ff9c6e" stroke="#ff7a45" strokeWidth="2" width="90"
                                      height="60"/>
                                <text fontSize="14" xmlSpace="preserve" fill="#000000" textAnchor="middle"
                                      fontFamily="Arial, helvetica, sans-serif" transform="matrix(1,0,0,1,45,30)">
                                    <tspan dy="0.3em" className="v-line">A</tspan>
                                </text>
                            </g>
                            <g
                                className="x6-cell x6-node" transform="translate(200,200)">
                                <circle fill="#d3f261" stroke="#bae637" strokeWidth="2" cx="20" cy="20"
                                        r="20"/>
                                <text fontSize="14" xmlSpace="preserve" fill="#000000" textAnchor="middle"
                                      fontFamily="Arial, helvetica, sans-serif" transform="matrix(1,0,0,1,20,20)">
                                    <tspan dy="0.3em" className="v-line">B</tspan>
                                </text>
                            </g>
                            <g
                                className="x6-cell x6-edge">
                                <path fill="none" cursor="pointer" stroke="transparent" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth="10"
                                      d="M 170.64 160.77 L 205.28 202.33"/>
                                <path fill="none" pointerEvents="none" strokeLinejoin="round" stroke="#333"
                                      strokeWidth="2" d="M 170.64 160.77 L 205.28 202.33"
                                      markerEnd="url(#marker-v0-3764440138)"/>
                            </g>
                            <g className="x6-graph-svg-decorator"/>
                            <g className="x6-graph-svg-overlay"/>
                        </g>
                    </g>
                </svg>
            </div>

            {/*<div id={'container'} style={{width: 500, height: 500, border: '1px solid red'}}/>
            */}

        </div>
    )
}