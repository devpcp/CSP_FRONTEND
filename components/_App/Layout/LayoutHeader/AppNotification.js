import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { getTimeDifference } from "../../../@gull/@utils";

const AppNotification = () => {

    const [notificationList, setNotificationList] = useState([
        // {
        //     icon: "i-Speach-Bubble-6",
        //     title: "New message",
        //     description: "James: Hey! are you busy?",
        //     time: "2019-10-30T02:10:18.931Z",
        //     color: "primary",
        //     status: "New",
        // },
        // {
        //     icon: "i-Receipt-3",
        //     title: "New order received",
        //     description: "1 Headphone, 3 iPhone",
        //     time: "2019-03-10T02:10:18.931Z",
        //     color: "success",
        //     status: "New",
        // },
        // {
        //     icon: "i-Empty-Box",
        //     title: "Product out of stock",
        //     description: "1 Headphone, 3 iPhone",
        //     time: "2019-05-10T02:10:18.931Z",
        //     color: "danger",
        //     status: "3",
        // },
        // {
        //     icon: "i-Data-Power",
        //     title: "Server up!",
        //     description: "Server rebooted successfully",
        //     time: "2019-03-10T02:10:18.931Z",
        //     color: "success",
        //     status: "3",
        // },
    ])


    return (
        <Dropdown>
            <Dropdown.Toggle
                as="div"
                id="dropdownNotification"
                className="badge-top-container toggle-hidden"
            >
                {/* <span className="badge bg-primary cursor-pointer" style={{ color: "#fff" }}>0</span> */}
                <i className="i-Bell text-muted header-icon"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="notification-dropdown">
                {notificationList.map((note, index) => (
                    <div key={index} className="dropdown-item d-flex">
                        <div className="notification-icon">
                            <i className={`${note.icon} text-${note.color} mr-1`}></i>
                        </div>
                        <div className="notification-details flex-grow-1">
                            <p className="m-0 d-flex align-items-center">
                                <span>{note.title}</span>
                                <span
                                    className={`badge rounded-pill bg-${note.color} ms-1 me-1`}
                                >
                                    {note.status}
                                </span>
                                <span className="flex-grow-1"></span>
                                <span className="text-small text-muted ms-auto">
                                    {getTimeDifference(new Date(note.time))} ago
                                </span>
                            </p>
                            <p className="text-small text-muted m-0" >
                                {note.description}
                            </p>
                        </div>
                    </div>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
};

export default AppNotification;

