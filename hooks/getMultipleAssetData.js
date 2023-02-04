import { useState } from 'react'
import useAssetData from './useAssetData'

export default function getMultipleAssetData(addresses, pool){
  
  var fullAsset = useAssetData(addresses[0])
  if ( fullAsset ) return [ fullAsset ]
  return []
  
}