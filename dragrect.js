try {
  var data = JSON.parse(localStorage.getItem('__fl_p_data_key'))
} catch(e){}
var mockData = [
  {"type":"wall","x1":50,"x2":314,"y1":150,"y2":150},{"type":"door","x1":50,"x2":50,"y1":188,"y2":233},
  {"type":"window","x1":198,"x2":146,"y1":150,"y2":150},{"type":"wall","x1":50,"x2":50,"y1":150,"y2":271},
  {"type":"wall","x1":50,"x2":314,"y1":271,"y2":271},{"type":"wall","x1":314,"x2":314,"y1":150,"y2":271},
  {"type":"window","x1":279,"x2":230,"y1":150,"y2":150},{"type":"wall","x1":50,"x2":50,"y1":99,"y2":30},
  {"type":"door","x1":130,"x2":130,"y1":73,"y2":30},{"type":"window","x1":210,"x2":210,"y1":73,"y2":30}
]
var defaultData = [{
  type: 'wall', x1: 50, x2: 50, y1: 130, y2: 30
}, {
  type: 'door', x1: 120, x2: 120, y1: 80, y2: 30
}, {
  type: 'window', x1: 210, x2: 210, y1: 80, y2: 30
}]

setTimeout(e => window.FloorPlanCreator.load(data || mockData /*defaultData*/), 100)

window.FloorPlanCreator = {
  load: data => {
    var i = 0, item, timer = e => {
      if (i < data.length) {
        item = data[i]
        window.FloorPlanCreator
          ['make' + item.type.charAt(0).toUpperCase() + item.type.slice(1)]
          (item.x1, item.x2, item.y1, item.y2)
        i++
        setTimeout(timer, 10)
      }
    }
    timer()
  },
  unload: cb => {
    var i = 0, item, data = [], timer = e => {
      if (i < window.FloorPlanCreator.pool.length) {
        item = window.FloorPlanCreator.pool[i]
        data.push({
          type: item.type, x1: Number(item.attr('x1')), x2: Number(item.attr('x2')), y1: Number(item.attr('y1')), y2: Number(item.attr('y2'))
        })
        i++
        setTimeout(timer, 10)
      } else {
        cb(data)
      }
    }
    timer()
  },
  save: e => {
    window.FloorPlanCreator.unload(data => localStorage.setItem('__fl_p_data_key', JSON.stringify(data)))
  },
  pool: [],
  makeWall: (x1 = defaultData[0].x1, x2 = defaultData[0].x2, y1 = defaultData[0].y1, y2 = defaultData[0].y2) => {
    var line = walls.append('line').attr('class', 'wall-svg-component')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .on('mouseenter', e => !blockDotHover && dotHoverEnter(line))
        .on('mouseleave', e => !blockDotHover && dotHoverLeave(line))
        .call(d3.drag().on('start', e => {
            dotHoverLeave(line)
            blockDotHover = true
            svg.attr('cursor', 'move')
          }).on('end', e => {
            dotHoverEnter(line)
            blockDotHover = false
            svg.attr('cursor', '')
          })
          .on('drag', e => {
            var dx = d3.event.dx, dy = d3.event.dy, x1, x2, y1, y2
            for (var i = 0; i < dots.length; i += iStep) {
              if (dots[i+3] === line) {
                dots[i+1] += dx
                dots[i+2] += dy
                if (!x1) {
                  x1 = dots[i+1]
                  y1 = dots[i+2]
                } else {
                  x2 = dots[i+1]
                  y2 = dots[i+2]
                  break
                }
              }
            }
            line.dot1.attr('cx', x1).attr('cy', y1)
            line.dot2.attr('cx', x2).attr('cy', y2)
            line.attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
          }))
    line.dotRadius = '2px'
    line.type = 'wall'
    makeDot(line, x1, y1, 1)
    makeDot(line, x2, y2, 2)
    window.FloorPlanCreator.pool.push(line)
  },
  makeWindow: (x1 = defaultData[1].x1, x2 = defaultData[1].x2, y1 = defaultData[1].y1, y2 = defaultData[1].y2) => {
    var line = windows.append('line').attr('class', 'window-wall-svg-component')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .on('mouseenter', e => dotHoverEnter(line))
        .on('mouseleave', e => dotHoverLeave(line))
    line.window = windows.append('line').attr('class', 'window-svg-component')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .on('mouseenter', e => dotHoverEnter(line))
        .on('mouseleave', e => dotHoverLeave(line))
    line.dotRadius = '0px'
    makeDot(line, x1, y1, 1)
    makeDot(line, x2, y2, 2)
    line.dot3 = walls.append('circle').attr('cx', x1).attr('cy', y1)
      .attr('r', '1px').attr('class', 'dot-svg-component')
    line.dot4 = walls.append('circle').attr('cx', x2).attr('cy', y2)
      .attr('r', '1px').attr('class', 'dot-svg-component')
    line.type = 'window'
    window.FloorPlanCreator.pool.push(line)
  },
  makeDoor: (x1 = defaultData[2].x1, x2 = defaultData[2].x2, y1 = defaultData[2].y1, y2 = defaultData[2].y2) => {
    var line = windows.append('line').attr('class', 'door-wall-svg-component')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .on('mouseenter', e => dotHoverEnter(line))
        .on('mouseleave', e => dotHoverLeave(line)),
      distance = Math.ceil(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
      [x3, y3] = angleDots(x1, x2, y1, y2)
    line.door = windows.append('line').attr('class', 'door-svg-component')
        .attr('x1', x1).attr('y1', y1).attr('x2', x3).attr('y2', y3)
        .on('mouseenter', e => dotHoverEnter(line))
        .on('mouseleave', e => dotHoverLeave(line))
    line.dotRadius = '1px'
    makeDot(line, x1, y1, 1)
    makeDot(line, x2, y2, 2)
    line.type = 'door'
    window.FloorPlanCreator.pool.push(line)
  }
}
var svg = d3.select('#svg-div').append('svg')
var walls = svg.append('g'), windows = svg.append('g'), dotsGroup = svg.append('g'), snap = 10,
dots = [], iStep = 5, dotRadiusHover = '5px', blockDotHover,
angleDots = (x1, x2, y1, y2) => {
    var L = Math.ceil(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
        Ang = Math.atan2(y2 - y1, x2 - x1) - 0.7853981633974483
//     console.log(Ang/Math.PI*180, Ang, x1, y1, x2, y2, x3, y3)
    return [Math.ceil(x1 + Math.cos(Ang) * L), Math.ceil(y1 + Math.sin(Ang) * L)]
},
dragDot = (line, movedDot, hash) => e => {
  var i, x = d3.event.x, y = d3.event.y
  for (i = 0; i < dots.length; i += iStep) { // snap other dots
    if (dots[i] !== hash) {
      if ((dots[i+1] + snap) > x && (dots[i+1] - snap) < x) { x = dots[i+1] } // snap other line
      if ((dots[i+2] + snap) > y && (dots[i+2] - snap) < y) { y = dots[i+2] }
    }
  }
  line['dot' + movedDot].attr('cx', x).attr('cy', y)
  line.attr('x' + movedDot, x).attr('y' + movedDot, y)
  if (line.window) {
    line.window.attr('x' + movedDot, x).attr('y' + movedDot, y)
    line['dot' + (movedDot+2)].attr('cx', x).attr('cy', y)
  }
  if (line.door) {
    var x1 = Number(line.attr('x1')), y1 = Number(line.attr('y1')),
      [x3, y3] = angleDots(x1, line.attr('x2'), y1, line.attr('y2'))
    if (movedDot === 1) {
      line.door.attr('x1', x3).attr('y1', y3)
               .attr('x2', x1).attr('y2', y1)
    } else {
      line.door.attr('x1', x1).attr('y1', y1)
               .attr('x2', x3).attr('y2', y3)
    }
  }
},
dragDotEnd = (line, dotNumber, hash) => e => {
  for (var i = 0; i < dots.length; i += iStep) { // dot update
    if (dots[i] === hash) {
      dots[i+1] = Number(line['dot' + dotNumber].attr('cx'))
      dots[i+2] = Number(line['dot' + dotNumber].attr('cy'))
      break
    }
  }
},
dotHoverEnter = line => {
  line.dot1.attr('r', dotRadiusHover)
  line.dot2.attr('r', dotRadiusHover)
},
dotHoverLeave = line => {
  line.dot1.attr('r', line.dotRadius)
  line.dot2.attr('r', line.dotRadius)
},
makeDot = (line, cx, cy, dotNumber) => {
  var hash = Math.random()
  line['dot' + dotNumber] = dotsGroup.append('circle').attr('cx', cx).attr('cy', cy)
    .attr('r', line.dotRadius).attr('class', 'dot-svg-component')
    .on('mouseenter', e => dotHoverEnter(line))
    .on('mouseleave', e => dotHoverLeave(line))
    .call(d3.drag().on('drag', dragDot(line, dotNumber, hash))
      .on('end', dragDotEnd(line, dotNumber, hash)))
  dots.push(hash, cx, cy, line, line['dot' + dotNumber])
}
