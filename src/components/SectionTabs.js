import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { colors } from '../theme/colors';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import WorldScreen from '../screens/WorldScreen';

const renderScene = SceneMap({
  foryou: ForYouFeed,
  following: FollowingFeed,
  communities: CommunitiesScreen,
  world: WorldScreen,
});

const SectionTabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'foryou', title: 'ForYou' },
    { key: 'following', title: 'Following' },
    { key: 'communities', title: 'Communities' },
    { key: 'world', title: 'World' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: colors.lavender }}
          style={{ backgroundColor: colors.background }}
          labelStyle={{ color: colors.text, fontWeight: '600' }}
          scrollEnabled
        />
      )}
    />
  );
};

export default SectionTabs;
