import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

let tvScriptLoadingPromise;

export default function TradingViewWidget({width, height, symbol}) {
  const onLoadScriptRef = useRef();

  var chartOptions = {
    
  }
  var widgetOptions = {
    "container_id": "chart_container",
    "theme": "dark",
    "disabled_features": [
        "timeframes_toolbar",
        "header_undo_redo",
        "use_localstorage_for_settings"
    ],
    "locale": "en",
    "debug": false,
    "fullscreen": false,
    "symbol": symbol,
    "interval": "60",
    "overrides": {
        "paneProperties.backgroundGradientStartColor": "red",
        "paneProperties.backgroundGradientEndColor": "red",
        "paneProperties.backgroundType": "solid",
        "paneProperties.background": "#121418",
        "scalesProperties.backgroundColor": "#121418",
        "symbolWatermark.visibility": false,
        "--tv-color-pane-background": "rgb(251, 223, 244)",
    },
    "allow_symbol_change": true,
    "timezone": "Etc/GMT-8",
    "autosize": true
  }
  useEffect(
    () => {
      onLoadScriptRef.current = createWidget;

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }

      tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

      return () => onLoadScriptRef.current = null;

      function createWidget() {
        if (document.getElementById('chart_container') && 'TradingView' in window) {
          console.log(window.TradingView)
          var tv = new window.TradingView.widget(widgetOptions);
          // var tv = new window.TradingView.chart(chartOptions);
          console.log(tv)
        }
        
      }
    },
    [symbol]
  );

  return (<>
    <div className='tradingview-widget-container'>
      <div id='chart_container' style={{ height: height ?? 500, width: width ?? '100%', backgroundColor: "#121418"}} />
    </div>
    </>
  );
}
