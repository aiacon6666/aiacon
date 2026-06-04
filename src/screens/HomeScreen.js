import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import SectionTabs from '../components/SectionTabs';
import ForYouFeed from '../components/ForYouFeed';
import FollowingFeed from '../components/FollowingFeed';
import CommunitiesScreen from './CommunitiesScreen';
import WorldScreen from './WorldScreen';
import AboutStories from '../components/AboutStories';
import CreateStory from '../components/CreateStory';
import StoryViewer from '../components/StoryViewer';

const TABS = ['For You', 'Following', 'Communities', 'World'];

function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const [createStoryVisible, setCreateStoryVisible] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [viewingStories, setViewingStories] = useState([]);

  function handleViewStory(stories) {
    setViewingStories(stories);
    setStoryViewerVisible(true);
  }

  function renderContent() {
    if (activeTab === 0) return <ForYouFeed />;
    if (activeTab === 1) return <FollowingFeed />;
    if (activeTab === 2) return <CommunitiesScreen navigation={navigation} />;
    if (activeTab === 3) return <WorldScreen />;
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AiaCon</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Discover')}>
            <Ionicons name="search-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NewPost')}>
            <Ionicons name="add-circle-outline" size={26} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      {(activeTab === 0 || activeTab === 1) && (
        <AboutStories
          onCreateStory={() => setCreateStoryVisible(true)}
          onViewStory={handleViewStory}
        />
      )}

      {/* Tabs */}
      <SectionTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {/* Content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>

      <CreateStory visible={createStoryVisible} onClose={() => setCreateStoryVisible(false)} />
      <StoryViewer
        visible={storyViewerVisible}
        stories={viewingStories}
        onClose={() => setStoryViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.text,
    textShadowColor: Colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontFamily: 'FiraCode-Regular',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 16, padding: 2 },
});

export default HomeScreen;
