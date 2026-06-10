import { Component } from 'react';
import ServerError from '../pages/ServerError';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught application error', error, info);
  }

  render() {
    if (this.state.error) return <ServerError onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
