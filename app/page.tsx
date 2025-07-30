"use client";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';
// import Head from 'next/head';

const MapComponent = dynamic(() => import('./raster-elevation/MapRasterElevation'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.page}>
        <MapComponent />
        {/* <button className="bg-blue-700 text-white p-4 rounded-lg hover:bg-blue-800">Click me</button> */}
        {/* <button id='testButton' className="primary z-10">Click me</button> */}
    </div>
  );
}