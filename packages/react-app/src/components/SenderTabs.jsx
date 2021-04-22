import React from 'react';
import { Tabs, message } from 'antd';

import * as colors from '../themes/dark';

const { TabPane } = Tabs;

export default class SenderTabs extends React.Component {
  newTabIndex = 0;

  initialPanes = [
    { title: 'NFT', content: this.props.form, key: '1' },
  ];

  state = {
    activeKey: this.initialPanes[0].key,
    panes: this.initialPanes,
  };

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    message.info('New feature coming soon!');
    return;
    // const { panes } = this.state;
    // const activeKey = `newTab${this.newTabIndex++}`;
    // const newPanes = [...panes];
    // newPanes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    // this.setState({
    //   panes: newPanes,
    //   activeKey,
    // });
  };

  remove = targetKey => {
    const { panes, activeKey } = this.state;
    let newActiveKey = activeKey;
    let lastIndex;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter(pane => pane.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    this.setState({
      panes: newPanes,
      activeKey: newActiveKey,
    });
  };

  render() {
    const { panes, activeKey } = this.state;
    return (
      <Tabs
        type="editable-card"
        onChange={this.onChange}
        activeKey={activeKey}
        onEdit={this.onEdit}
        hideAdd={false}
        style={{ backgroundColor: colors.LIGHT_PINK, borderRadius: "4px", color: colors.LIGHT_PURPLE }}
        tabBarStyle={{ backgroundColor: colors.PURPLE }}
      >
        {panes.map(pane => (
          <TabPane tab={<div style={{ padding: "0px 10px"}}>{pane.title}</div>} key={pane.key} closable={false}>
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
