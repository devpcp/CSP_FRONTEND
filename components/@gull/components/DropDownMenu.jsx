import React, { Component } from "react";
import Link from "next/link";
import { classList } from "../@utils";
import DropDownMenuItem from "./DropDownMenuItem";

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
        return (
          <li
            key={i}
            className={classList({
              "nav-item": true,
              open: this.state.open,
            })}
            onClick={this.props.closeSecSidenav}
          >
            <Link activeClassName="selected" exact href={item.path}>
              <i className={`nav-icon ${item.icon}`}></i>
              <span className="item-name">{item.name}</span>
            </Link>
          </li>
        );
      }
    });

  render() {
    return <ul className="childNav">{this.renderLevels(this.props.menu)}</ul>;
  }
}

export default DropDownMenu;
