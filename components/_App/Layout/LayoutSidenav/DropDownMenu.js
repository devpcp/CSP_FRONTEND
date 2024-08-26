import React, { Component } from "react";
import { classList } from "../../../@gull/@utils";
import DropDownMenuItem from "./DropDownMenuItem";
import Link from "next/link";

class DropDownMenu extends Component {
    state = {
        open: false,
    };

    onItemClick = (e) => {
        e.preventDefault();
        this.setState({ open: !this.state.open });
    };

    renderLevels = (items) =>
        items.map((item, i) => {
            if (item.sub) {
                return (
                    <DropDownMenuItem key={i} item={item}>
                        {this.renderLevels(item.sub)}
                    </DropDownMenuItem>
                );
            } else {
                if (item.read === 1) {
                    return (
                        <li
                            key={i}
                            className={classList({
                                "nav-item": true,
                                open: this.state.open,
                            })}
                            onClick={this.props.closeSecSidenav}
                        >
                            <Link href={item.path}>
                                <a className={this.props.router === item.path ? "selected" : ""} exact>
                                    <i className={`nav-icon ${item.icon ? item.icon : "i-Receipt"}`}></i>
                                    <span className="item-name">{item.application_name[this.props.locale]}</span>
                                </a>
                            </Link>
                        </li>
                    );
                }

            }
        });

    render() {
        return <ul className="childNav">{this.renderLevels(this.props.menu)}</ul>;
    }
}

export default DropDownMenu;
