import * as React from "react";
import SvgManager from "../../src/svg"
import CanvasManager from "../../src/canvas";
import Rect from "../../src/shape/rect";
import Text from "../../src/shape/text";
import Line from "../../src/shape/line";
import Ellipse from "../../src/shape/ellipse";
import Circle from "../../src/shape/circle";
import Path from "../../src/shape/path";

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
                grid: true,
                axis: true
            })
            canvas.translate(100, 100)
            const rect1 = new Rect({x: 0, y: 0, w: 200, h: 200})
            rect1.name = 'rect1'
            rect1.style.borderRadius = 20
            rect1.addEventListener('dragStart', (e) => {
                //console.log('dragStart1')

            })
            const rect2 = new Rect({x: 150, y: 150, w: 200, h: 200})
            rect2.addEventListener('dragStart', (e) => {
                //console.log('dragStart2')
                e.stopPropagation();
            })

            rect2.addEventListener('drag', (e) => {
                //console.log('drag')
                e.stopPropagation();
            })
            rect2.addEventListener('dragEnd', (e) => {
                //console.log('dragEnd')
                e.stopPropagation();
            })
            rect2.addEventListener('click', (e) => {
                //console.log('click')
                e.stopPropagation();
            })
            rect2.addEventListener('mouseMove', (e) => {
                //console.log('mouseMove',e)
                //e.stopPropagation();
            })
            rect2.addEventListener('mouseEnter', (e) => {
                //console.log('mouseEnter',e)
                //e.stopPropagation();
            })
            rect2.addEventListener('mouseLeave', (e) => {
                //console.log('mouseLeave',e)
                //e.stopPropagation();
            })
            rect2.style.background = 'red'
            rect2.style.borderRadius = 100
            rect2.style.cursor = 'move'
            rect2.name = 'rect2';
            //rect2.rotate(90)
            //console.log(rect1, rect2);
            rect1.addChild(rect2)
            //canvas.addView(rect1)
            //rect1.translate(50, 50)
            //canvas.addView(rect2)
            const text = new Text();
            text.x = 250
            text.y = 250;
            text.drawBBox = true;
            text.text = '这是测试文字安徽省士大夫士大夫'
            //text.style.wrap = 'nowrap';
            text.style.color = 'red';
            text.style.cursor = 'pointer';
            text.maxWidth = 120;
            //canvas.addView(text)
            const line = new Line({x1: 0, y1: 0, x2: 150, y2: 150, strokeWidth: 20});
            line.drawBBox = true;
            //canvas.addView(line)
            const ellipse = new Ellipse({rx: 100, ry: 50, cx: 0, cy: 0, rotation: Math.PI / 4})

            ellipse.drawBBox = true;
            ellipse.drawShape = true;
            //canvas.addView(ellipse)

            const circle = new Circle({cx: 100, cy: 100, r: 50})

            circle.drawBBox = true;
            circle.drawShape = true;
           // canvas.addView(circle)
            const ad1=`M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z`
            const ad2=`M 10,10 h 10
       m  0,10 h 10
       m  0,10 h 10
       M 40,20 h 10
       m  0,10 h 10
       m  0,10 h 10
       m  0,10 h 10
       M 50,50 h 10
       m-20,10 h 10
       m-20,10 h 10
       m-20,10 h 10`
            const ad3=`M 10,10
           L 90,90
           V 10
           H 50`
            const ad4=`M 10,90
           C 30,90 25,10 50,10
           S 70,90 90,90`
            const ad5=`M 10,50
           Q 25,25 40,50
           t 30,0 30,0 30,0 30,0 30,0`
            console.log(ad1);
            const path = new Path({
                d: ad1
            })
            //path.style.strokeStyle='red'
            path.drawBBox = true;
            path.drawShape = true;
            canvas.addView(path)

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