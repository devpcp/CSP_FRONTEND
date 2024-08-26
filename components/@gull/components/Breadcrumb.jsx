import React, { Fragment } from "react";
import Link from "next/link";

const Breadcrumb = ({ routeSegments }) => {
  return (
    <Fragment>
      <div className="breadcrumb">
        {routeSegments ? (
          <Fragment>
            <h1>{routeSegments[routeSegments.length - 1]["name"]}</h1>
          </Fragment>
        ) : null}
        <ul>
          {routeSegments
            ? routeSegments.map((route, index) =>
                index !== routeSegments.length - 1 && route.path ? (
                  <li key={index}>
                    <Link href={route.path}>
                      <a className="capitalize text-muted">{route.name}</a>
                    </Link>
                  </li>
                ) : (
                  <li key={index}>
                    <span className="capitalize text-muted">{route.name}</span>
                  </li>
                )
              )
            : null}
        </ul>
      </div>
      <div className="separator-breadcrumb border-top"></div>
    </Fragment>
  );
};

export default Breadcrumb;
