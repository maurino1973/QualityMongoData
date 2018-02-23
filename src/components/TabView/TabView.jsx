import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './TabView.less';

class TabBar extends Component {
  static displayName = 'TabBar';

  static propTypes = {
    children: PropTypes.Array
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0
    };
  }

  handleOnClick(key, event) {
    event.preventDefault();

    this.setState({
      activeTab: key
    });
  }

  renderTabBar(key) {
    const tab = this.props.children[key];
    return (
      <li className={ this.state.activeTab == key ? styles.activetab : styles.tab}>
        <div onClick={ this.handleOnClick.bind(this, key) }>
          { tab.props.title }
        </div>
      </li>
    );
  }

  render() {
    let activeTab = this.props.children[this.state.activeTab];

    return (
      <div>
        <ul className={styles.tabbar}>
          { Object.keys(this.props.children).map(this.renderTabBar.bind(this)) }
        </ul>
        <div className={styles.tabcontentback}>
          <div className={styles.tabcontent}>
            { activeTab }
          </div>
        </div>
      </div>
    );
  }
}

class Tab extends Component {
  static displayName = 'Tab';

  static propTypes = {
    title:          PropTypes.string,
    contentFactory: PropTypes.function
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        { this.props.contentFactory() }
      </div>
    );
  }
}

export default TabBar;
export { Tab };
