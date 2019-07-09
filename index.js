import React from 'react'
import { View, Platform, Dimensions, WebView } from 'react-native'
import PropTypes from 'prop-types'
const { width } = Dimensions.get('window')
const isIOS = Platform.OS === 'ios'

export default class Echart extends React.Component {
  constructor(props){
    super(props)
    this._sendAction = this._sendAction.bind(this)
  }
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    clicked: PropTypes.func,
    clicked: PropTypes.func,
    option: PropTypes.object,
    loaded: PropTypes.func
  }
  static defaultProps = {
    width: width,
    height: width
  }
  componentDidMount(){
    this._initOption()
  }
  _initOption(){
    if(this.props.option){
      let timer = setTimeout(()=>{
        clearTimeout(timer)
        if(this.inited){
          this.setOption(this.props.option)
        }else{
          this._initOption()
        }
      }, 500)
    }
  }
  setOption(option){
    this._sendAction('SETOPTION', option)
  }
  hideTip(name){
    this._sendAction('HIDETIP')
  }
  _handleMsg(e){
    try{
      const message = JSON.parse(e.nativeEvent.data)
      switch(message.type){
        case 'LOG':
          if(__DEV__){ console.log(message) }
          break
        case 'INITIAL':
          this.inited = true
          if(this.props.loaded){
            this.props.loaded()
          }
          break
        case 'ACTIVE':
          if(__DEV__){ console.log(message) }
          if(this.props.clicked){
            this.props.clicked(message.data)
          }
          break
        case 'UNACTIVE':
          if(__DEV__){ console.log(message) }
          if(this.props.unclicked){
            this.props.unclicked(message.data)
          }
          break
        case 'FINISHED':
          break
      }
    }catch(err){
      if(__DEV__){ console.log(err) }
    }
  }
  _sendAction(action, data){
    let jsonString = JSON.stringify({type: action, data})
    this.webview.postMessage(jsonString)
  }
  init(){
    this._sendAction('INIT', {
      width: this.props.width,
      height: this.props.height
    })
  }
  render(){
    const scalesPageToFit = Platform.OS === 'android'
    let pageSource = isIOS ? require('./chart.html') : { uri: 'file:///android_asset/chart.html' }
    return (
      <View style={{width: this.props.width, height: this.props.height}}>
        <WebView
          ref={c=>{this.webview=c}}
          scrollEnabled={false}
          source={pageSource}
          scalesPageToFit={scalesPageToFit}
          startInLoadingState={false}
          domStorageEnabled={true}
          style={{overflow: 'hidden'}}
          initialScale={100}
          javaScriptEnabled={true}
          javaScriptEnabledAndroid={true}
          onMessage={this._handleMsg.bind(this)}
          onLoad={()=>{this.init()}} />
      </View>
    )
  }
}