import * as React from "react";
import SvgManager from "../../src/svg"
import CanvasManager from "../../src/canvas";
import Rect from "../../src/shape/rect";
import Text from "../../src/shape/text";
import Line from "../../src/shape/line";
import Ellipse from "../../src/shape/ellipse";
import Circle from "../../src/shape/circle";
import Path from "../../src/shape/path";
import Svg from "../../src/react/svg";
import SvgPath from "../../src/react/path";
import SvgPolygon from "../../src/react/polygon";
import SvgPolyline from "../../src/react/polyline";
import SvgRect from "../../src/react/rect"
import SvgImage from "../../src/react/image"
import SvgEllipse from "../../src/react/ellipse"
import SvgCircle from "../../src/react/circle"
import SvgText from "../../src/react/text"
import SvgG from "../../src/react/g"
import Defs, {SvgElement} from "../../src/react/defs";
import Use from "../../src/shape/use";

const {FeGaussianBlur, Filter} = SvgElement;
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
    const [d, setD] = React.useState<string>(`M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z`)
    React.useEffect(() => {
        setTimeout(() => {
            console.log('setD');
            setD(`M 10,50
           Q 25,25 40,50
           t 30,0 30,0 30,0 30,0 30,0`)
        }, 5000)
    }, [])

    return (
        <div>
            <Svg width={1920} height={1080}>
                {/* <SvgPath d={d}
                         stroke='red'/>
                <SvgPolygon points={'100,10 40,198 190,78 10,78 160,198'}
                            style={{
                                fill: 'lime',
                                stroke: "purple",
                                strokeWidth: 5,
                                fillRule: "nonzero",
                            }}
                />
                <SvgPolyline points={'0,40 40,40 40,80 80,80 80,120 120,120 120,160'}
                             style={{
                                 stroke: "purple",
                                 strokeWidth: 5,
                             }}
                />
                <SvgRect
                    x={200}
                    y={200}
                    rx={200}
                    ry={200}
                    width={200}
                    height={200}
                    style={{
                        stroke: "purple",
                        strokeWidth: 5,
                    }}
                />
                <SvgCircle
                    r={100}
                    cx={200}
                    cy={200}
                    style={{
                        stroke: "purple",
                        strokeWidth: 5,
                    }}
                />*/}
                {/*<SvgText x={100} y={100} path={'M75,20 a1,1 0 0,0 100,0'} startOffset={0} dy={5} spacing={0} >
                    这是我的测试这是我的测试这是我的测试
                </SvgText>
                <SvgText x={300} y={300} path={'M75,20 a1,1 0 0,0 100,0'} startOffset={0} dy={5} spacing={0} >
                    这是我的测试这是我的测试这是我的测试
                </SvgText>*/}
                {/*<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{'display':'none'}}>
                    <defs>
                        <filter id="f1" x="0" y="0">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                        </filter>
                    </defs>
                </svg>*/}
                <SvgText x={100} y={100} path={'M75,20 a1,1 0 0,0 100,0'} startOffset={0} dy={5} spacing={0}
                         style={{fontSize: 50}}>
                    这是我的测试这是我的测试这是我的测试
                </SvgText>
               {/* <SvgG transform={'translate(100,100)'}>
                    <Defs>
                        <Filter id="f1" x="0" y="0">
                            <FeGaussianBlur in="SourceGraphic" stdDeviation="15"/>
                        </Filter>
                        <SvgRect
                            id='svg-rect'
                            x={100}
                            y={100}
                            //rx={200}
                            //ry={200}
                            width={100}
                            height={100}
                            filter="url(#f1)"
                            style={{
                                //stroke: "red",
                                fill: "yellow",
                                fillOpacity: '0.5',
                                //strokeWidth: 5,
                            }}
                        />
                    </Defs>
                    <SvgRect
                        x={200}
                        y={200}
                        //rx={200}
                        //ry={200}
                        width={200}
                        height={200}
                        style={{
                            stroke: "purple",
                            strokeWidth: 5,
                        }}
                        onMouseMove={(e) => {
                            //console.log('move', e)
                        }}
                    />

                    <Use xlinkHref='#svg-rect'/>
                </SvgG>*/}
                {/*  <SvgImage
                    x={200}
                    y={200}
                    width={200}
                    style={{
                        //stroke: "purple",
                        //strokeWidth: 1,
                    }}
                    onMouseMove={(e) => {
                        //console.log('move', e)
                    }}
                    xlinkHref={'https://ts1.cn.mm.bing.net/th/id/R-C.171e8fe1aa1544a1868ab710eed82d82?rik=FLPxvVVL9C9bnQ&riu=http%3a%2f%2fwww.pp3.cn%2fuploads%2fallimg%2f200710%2f14-200G00Z321.jpg&ehk=Lb0IHCCZIdqYQOi28m%2borU8c1ARGbTEC%2f8WYzfwRuHo%3d&risl=&pid=ImgRaw&r=0'}
                />*/}
            </Svg>
            {/* <canvas width={500} height={500} ref={canvasRef}
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
*/}
            {/*<div id={'container'} style={{width: 500, height: 500, border: '1px solid red'}}/>
            */}

        </div>
    )
}