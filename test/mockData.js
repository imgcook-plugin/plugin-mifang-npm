module.exports = {
  "moduleData": {
    "id": 17679,
    "name": "hook",
    "cover": "https://img.alicdn.com/tfs/TB1mkjeqlr0gK0jSZFnXXbRRXXa-1404-1292.png",
  },
  "code": {
    "panelDisplay": [
      {
        "panelName": "index.jsx",
        "panelValue": "'use strict';import{createElement,useState,useEffect}from'rax';import View from'rax-view';import TitleNormal from'./TitleNormal';import TitleLarge from'./TitleLarge';import{IndexProvider}from'./context';import styles from'./index.css';export default function Page(){return(<IndexProvider><View><TitleNormal/><TitleLarge/></View></IndexProvider>)}",
        "panelType": "js"
      },
      {
        "panelName": "index.css",
        "panelValue": "",
        "panelType": "css"
      },
      {
        "panelName": "TitleNormal.jsx",
        "panelValue": "'use strict';import{createElement,useState,useEffect,memo}from'rax';import View from'rax-view';import Text from'rax-text';import styles from'./TitleNormal.css';export default memo(props=>{return(<View style={styles.titleNormal}><View style={styles.tagWrap}><Text style={styles.tag}>百亿补贴</Text></View><Text style={styles.info}>短标题限十个文字十个</Text></View>)});",
        "panelType": "js"
      },
      {
        "panelName": "TitleNormal.css",
        "panelValue": "",
        "panelType": "css"
      },
      {
        "panelName": "TitleLarge.jsx",
        "panelValue": "'use strict';import{createElement,useState,useEffect,memo}from'rax';import View from'rax-view';import Text from'rax-text';import styles from'./TitleNormal.css';export default memo(props=>{return(<View style={styles.titleNormal}><View style={styles.tagWrap}><Text style={styles.tag}>百亿补贴</Text></View><Text style={styles.info}>短标题限十个文字十个</Text></View>)});",
        "panelType": "js"
      },
      {
        "panelName": "TitleLarge.css",
        "panelValue": "",
        "panelType": "css"
      }
    ],
    "noTemplate": true
  }
};
