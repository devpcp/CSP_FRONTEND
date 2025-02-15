import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";

const CustomScrollbars = (props) => <Scrollbars  {...props} autoHide universal
    renderTrackHorizontal={props => <div {...props}
        style={{ display: 'none' }}
        className="track-horizontal" />} />;

export default CustomScrollbars;
