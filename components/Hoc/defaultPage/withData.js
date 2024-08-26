import React, { useEffect } from "react";
import Router from "next/router";
import { useSelector } from "react-redux";
import Preloader from "../../_App/Preloader";

export default (ComposedComponent) => (props) => {
	const { authUser, loadUser } = useSelector(({ auth }) => auth);
	useEffect(() => {
		if (authUser) {
			Router.push("/");
		}
	}, [authUser]);
	if (authUser) return <Preloader />;
	if (loadUser) return <Preloader />;

	return <ComposedComponent {...props} />;
};
