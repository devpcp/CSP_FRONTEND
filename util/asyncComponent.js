import dynamic from 'next/dynamic';
import Preloader from "../components/_App/Preloader";
import React from "react";

export default function asyncComponent(importComponent) {

  return dynamic(importComponent,
    {
      loading: () => <Preloader />
    });
}
