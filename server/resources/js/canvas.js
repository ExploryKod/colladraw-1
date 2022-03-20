import Colladraw from 'colladraw'
import Websocket from './websocket'

class HandleCanvas {
  constructor() {
    this.headerIcons = [...document.querySelectorAll('.header-icons > li')]
    this.toggleIcons = [...document.querySelectorAll('.toggle-icon')]
    this.toolsElements = [...document.querySelectorAll('.tools > li')]
    this.canvas = document.querySelector('#canvas')
    this.cd = new Colladraw(this.canvas)
    this.currentColor = null
    this.currentTool = null
    this.websocket = new Websocket(this.cd)
    this.tools = {
      pen: null,
      rubber: null,
      rectangle: null,
      ellipse: null,
      triangle: null,
      line: null,
      text: null,
      background: null,
    }
    this.colors = [
      '#f3b1af',
      '#f6d09a',
      '#fafd90',
      '#b0d9a0',
      '#9fd7de',
      '#a6c3fa',
      '#e4acec',
      '#bbb2f9',
      '#c1c1c1',
      '#111111',
    ]
    this.handle()
  }

  handle() {
    this.websocket.init(this.canvas)
    this.handleHeaderIcons()
    this.handlePanels()
  }

  handleHeaderIcons() {
    const toggleProfile = () => {
      profile.lastElementChild.classList.toggle('show')
    }

    profile.addEventListener('click', toggleProfile)
  }

  handlePanels() {
    const colorPicker = document.querySelector('#color-picker')

    const changeColor = () => {
      this.currentColor = colorPicker.value
    }

    const changeTool = (e) => {
      this.toolsElements.forEach((toolElement) => {
        toolElement.classList.remove('active')
      })

      const toolElement = e.target

      toolElement.classList.add('active')
      this.currentTool = this.tools[toolElement.id]
    }

    const togglePanel = (e) => {
      e.target.parentElement.parentElement.classList.toggle('show')
    }

    this.toggleIcons.forEach((toggleIcon) => {
      toggleIcon.addEventListener('click', togglePanel)
    })

    colorPicker.addEventListener('input', changeColor)

    this.toolsElements.slice(0, -2).forEach((toolElement) => {
      toolElement.addEventListener('click', changeTool)
    })
  }
}

new HandleCanvas()
