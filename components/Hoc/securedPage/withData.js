import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Preloader from "../../_App/Preloader";
import { setPermissionObj } from "../../../redux/actions/permissionActions";
import { useDispatch } from "react-redux";
import { Cookies } from 'react-cookie'
import _ from 'lodash'

export default (ComposedComponent) => (props) => {
  const { authUser, loadUser } = useSelector(({ auth }) => auth);
  const { permission } = useSelector(({ permission }) => permission);
  const [loading, setLoading] = useState(true)
  const routers = useRouter()
  const dispatch = useDispatch();
  const cookie = new Cookies();

  useEffect(() => {
    const access_token = cookie.get('access_token')
    if(!access_token) {
       Router.push("/login");
    }
  }, []);


  /* Permission */
  useEffect(() => {
    if (_.isArray(permission) && permission.length > 0) {
      checkUrlPermission(permission)
    }
  }, [permission]);


  const checkUrlPermission = (item) => {
    const url = item.map(e => e.path)
    const path = routers.pathname
    const index = url.findIndex(e => e == path)
    if (index === -1) {
      Router.push("/401");
    } else {
      setLoading(false)
      dispatch(setPermissionObj(item[index]));
    }
  }

  if (!authUser || loadUser || loading) return <Preloader />;

  return <ComposedComponent {...props} />;
};
