import React from 'react';
import Layout from '../../_App/Layout';

export default ComposedComponent => props => (
  <Layout>
    <ComposedComponent {...props} />
  </Layout>
);
