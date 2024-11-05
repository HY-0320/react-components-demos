import { Arrow } from './element/arrow'

const subjectColor = 'rgb(95, 149, 255)'
const backColor = 'rgb(255, 255, 255)'
// const textColor = 'rgb(0, 0, 0)'

const activeFill = 'rgb(247, 250, 255)'
const nodeMainFill = 'rgb(239, 244, 255)'
const comboFill = 'rgb(253, 253, 253)'
const disabledFill = 'rgb(250, 250, 250)'

const edgeMainStroke = 'rgb(224, 224, 224)'
const edgeInactiveStroke = 'rgb(234, 234, 234)'
const edgeDisablesStroke = 'rgb(245, 245, 245)'
const inactiveStroke = 'rgb(191, 213, 255)'

const highlightStroke = '#4572d9'
const highlightFill = 'rgb(223, 234, 255)'

const colorSet = {
  // for nodes
  mainStroke: subjectColor,
  mainFill: nodeMainFill,

  activeStroke: subjectColor,
  activeFill,

  inactiveStroke,
  inactiveFill: activeFill,

  selectedStroke: subjectColor,
  selectedFill: backColor,

  highlightStroke,
  highlightFill,

  disableStroke: edgeMainStroke,
  disableFill: disabledFill,

  // for edges
  edgeMainStroke,
  edgeActiveStroke: subjectColor,
  edgeInactiveStroke,
  edgeSelectedStroke: subjectColor,
  edgeHighlightStroke: subjectColor,
  edgeDisableStroke: edgeDisablesStroke,

  // for combos
  comboMainStroke: edgeMainStroke,
  comboMainFill: comboFill,

  comboActiveStroke: subjectColor,
  comboActiveFill: activeFill,

  comboInactiveStroke: edgeMainStroke,
  comboInactiveFill: comboFill,

  comboSelectedStroke: subjectColor,
  comboSelectedFill: comboFill,

  comboHighlightStroke: highlightStroke, // 'rgb(53, 119, 222)', // TODO: how to generate it ???
  comboHighlightFill: comboFill,

  comboDisableStroke: edgeInactiveStroke,
  comboDisableFill: disabledFill,
}

export const GLOBAL = {
  defaultNode: {
    type: 'circle',
    size: 20,
    style: {
      lineWidth: 1,
      stroke: colorSet.mainStroke,
      fill: nodeMainFill,
      color: colorSet.mainStroke,
      rx: 0,
      ry: 0,
    },
  },
  defaultEdge: {
    type: 'line',
    style: {
      lineWidth: 1,
      stroke: colorSet.edgeMainStroke,
      lineAppendWidth: 2,
      color: colorSet.edgeMainStroke,
    },
  },
  defaultArrow: {
    markerEndOffset: 8,
    markerStartOffset: 8,
    style: {
      path: Arrow.triangle(8, 8, 0),
      stroke: colorSet.edgeMainStroke,
      fill: colorSet.edgeMainStroke,
      anchor: '0.5 0.5',
      transformOrigin: 'center',
    },
  },
}
