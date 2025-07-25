import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Audio, Video, ResizeMode } from 'expo-av';
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark,
  Clock,
  Eye,
  Send,
  X,
  Filter,
  Search,
  Headphones,
  Video as VideoIcon,
  TrendingUp,
  Star,
  Users,
  Calendar,
  Download,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface MediaItem {
  id: string;
  type: 'podcast' | 'video';
  title: string;
  description: string;
  host: string;
  duration: string;
  thumbnail_url: string;
  media_url: string;
  category: string;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  isPlaying?: boolean;
}

interface Comment {
  id: string;
  media_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
  isLiked?: boolean;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  volume: number;
  isMuted: boolean;
}

const CATEGORIES = ['All', 'Labour Law', 'HR Strategy', 'Leadership', 'Compliance', 'Analytics', 'Recruitment'];

export default function MediaScreen() {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [newComment, setNewComment] = useState('');
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    volume: 1.0,
    isMuted: false,
  });

  const audioRef = useRef<Audio.Sound | null>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      loadMediaItems();
    } else {
      setLoading(false);
    }
  }, [user, selectedCategory]);

  const loadMediaItems = async () => {
    try {
      if (!isSupabaseConfigured) {
        setMediaItems([]);
        return;
      }

      let query = supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mediaWithInteractions = await Promise.all(
        (data || []).map(async (item) => {
          const { data: likeData } = await supabase
            .from('media_interactions')
            .select('id')
            .eq('media_id', item.id)
            .eq('user_id', user?.id)
            .eq('interaction_type', 'like')
            .maybeSingle();

          const { data: dislikeData } = await supabase
            .from('media_interactions')
            .select('id')
            .eq('media_id', item.id)
            .eq('user_id', user?.id)
            .eq('interaction_type', 'dislike')
            .maybeSingle();

          const { data: bookmarkData } = await supabase
            .from('media_interactions')
            .select('id')
            .eq('media_id', item.id)
            .eq('user_id', user?.id)
            .eq('interaction_type', 'bookmark')
            .maybeSingle();

          return {
            ...item,
            isLiked: !!likeData,
            isDisliked: !!dislikeData,
            isBookmarked: !!bookmarkData,
            isPlaying: false,
          };
        })
      );

      setMediaItems(mediaWithInteractions);
    } catch (error) {
      console.error('Error loading media items:', error);
      setMediaItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadComments = async (mediaId: string) => {
    try {
      if (!isSupabaseConfigured) return;

      const { data, error } = await supabase
        .from('media_comments')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithLikes = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: likeData } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...comment,
            isLiked: !!likeData
          };
        })
      );

      setComments(commentsWithLikes);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleInteraction = async (mediaId: string, type: 'like' | 'dislike' | 'bookmark') => {
    if (!user || !isSupabaseConfigured) return;

    try {
      const media = mediaItems.find(m => m.id === mediaId);
      if (!media) return;

      const isCurrentlyActive = type === 'like' ? media.isLiked : 
                               type === 'dislike' ? media.isDisliked : 
                               media.isBookmarked;

      if (isCurrentlyActive) {
        const { error } = await supabase
          .from('media_interactions')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id)
          .eq('interaction_type', type);

        if (error) throw error;
      } else {
        // Remove opposite interaction for like/dislike
        if (type === 'like' && media.isDisliked) {
          await supabase
            .from('media_interactions')
            .delete()
            .eq('media_id', mediaId)
            .eq('user_id', user.id)
            .eq('interaction_type', 'dislike');
        } else if (type === 'dislike' && media.isLiked) {
          await supabase
            .from('media_interactions')
            .delete()
            .eq('media_id', mediaId)
            .eq('user_id', user.id)
            .eq('interaction_type', 'like');
        }

        const { error } = await supabase
          .from('media_interactions')
          .insert({
            media_id: mediaId,
            user_id: user.id,
            interaction_type: type
          });

        if (error) throw error;
      }

      // Update local state
      setMediaItems(prev => prev.map(item => {
        if (item.id === mediaId) {
          const updates: any = {};
          
          if (type === 'like') {
            updates.isLiked = !item.isLiked;
            updates.likes_count = item.isLiked ? item.likes_count - 1 : item.likes_count + 1;
            if (item.isDisliked) {
              updates.isDisliked = false;
              updates.dislikes_count = item.dislikes_count - 1;
            }
          } else if (type === 'dislike') {
            updates.isDisliked = !item.isDisliked;
            updates.dislikes_count = item.isDisliked ? item.dislikes_count - 1 : item.dislikes_count + 1;
            if (item.isLiked) {
              updates.isLiked = false;
              updates.likes_count = item.likes_count - 1;
            }
          } else if (type === 'bookmark') {
            updates.isBookmarked = !item.isBookmarked;
          }

          return { ...item, ...updates };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error toggling interaction:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedMedia || !user || !isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('media_comments')
        .insert({
          media_id: selectedMedia.id,
          author_id: user.id,
          content: newComment
        });

      if (error) throw error;

      setNewComment('');
      loadComments(selectedMedia.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const playMedia = async (media: MediaItem) => {
    try {
      setSelectedMedia(media);
      setShowPlayerModal(true);

      if (media.type === 'podcast') {
        // Handle audio playback
        if (audioRef.current) {
          await audioRef.current.unloadAsync();
        }

        const { sound } = await Audio.loadAsync(
          { uri: media.media_url },
          { shouldPlay: false }
        );
        
        audioRef.current = sound;
        
        sound.setOnPlaybackStatusUpdate((status: any) => {
          setPlaybackStatus({
            isLoaded: status.isLoaded,
            isPlaying: status.isPlaying || false,
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis || 0,
            volume: status.volume || 1.0,
            isMuted: status.isMuted || false,
          });
        });
      }

      // Track view
      if (isSupabaseConfigured && user) {
        await supabase
          .from('media_interactions')
          .upsert({
            media_id: media.id,
            user_id: user.id,
            interaction_type: 'view'
          });
      }
    } catch (error) {
      console.error('Error playing media:', error);
      Alert.alert('Error', 'Failed to load media');
    }
  };

  const togglePlayback = async () => {
    try {
      if (selectedMedia?.type === 'podcast' && audioRef.current) {
        if (playbackStatus.isPlaying) {
          await audioRef.current.pauseAsync();
        } else {
          await audioRef.current.playAsync();
        }
      } else if (selectedMedia?.type === 'video' && videoRef.current) {
        if (playbackStatus.isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const openComments = (media: MediaItem) => {
    setSelectedMedia(media);
    setShowCommentsModal(true);
    loadComments(media.id);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMediaItems();
  };

  const filteredMedia = mediaItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMediaCard = (item: MediaItem) => (
    <TouchableOpacity key={item.id} style={styles.mediaCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.mediaGradient}>
        
        <View style={styles.mediaHeader}>
          <Image 
            source={{ uri: item.thumbnail_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400' }} 
            style={styles.mediaThumbnail} 
          />
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => playMedia(item)}>
            <Play size={24} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.mediaTypeIndicator}>
            {item.type === 'podcast' ? (
              <Headphones size={16} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <VideoIcon size={16} color="#FFFFFF" strokeWidth={2} />
            )}
          </View>
        </View>

        <View style={styles.mediaContent}>
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaTitle}>{item.title}</Text>
            <Text style={styles.mediaHost}>by {item.host}</Text>
            <Text style={styles.mediaDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View style={styles.mediaStats}>
            <View style={styles.statItem}>
              <Clock size={14} color="#71717A" strokeWidth={2} />
              <Text style={styles.statText}>{item.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={14} color="#71717A" strokeWidth={2} />
              <Text style={styles.statText}>{item.views_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={14} color="#71717A" strokeWidth={2} />
              <Text style={styles.statText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.mediaActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleInteraction(item.id, 'like')}>
              <ThumbsUp 
                size={18} 
                color={item.isLiked ? "#10B981" : "#64748B"} 
                strokeWidth={2}
                fill={item.isLiked ? "#10B981" : "none"}
              />
              <Text style={[styles.actionText, item.isLiked && { color: "#10B981" }]}>
                {item.likes_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleInteraction(item.id, 'dislike')}>
              <ThumbsDown 
                size={18} 
                color={item.isDisliked ? "#EF4444" : "#64748B"} 
                strokeWidth={2}
                fill={item.isDisliked ? "#EF4444" : "none"}
              />
              <Text style={[styles.actionText, item.isDisliked && { color: "#EF4444" }]}>
                {item.dislikes_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openComments(item)}>
              <MessageCircle size={18} color="#64748B" strokeWidth={2} />
              <Text style={styles.actionText}>{item.comments_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleInteraction(item.id, 'bookmark')}>
              <Bookmark 
                size={18} 
                color={item.isBookmarked ? "#F59E0B" : "#64748B"} 
                strokeWidth={2}
                fill={item.isBookmarked ? "#F59E0B" : "none"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share size={18} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlayerModal = () => (
    <Modal visible={showPlayerModal} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedMedia?.type === 'podcast' ? 'Audio Player' : 'Video Player'}
          </Text>
          <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.playerContainer}>
          {selectedMedia?.type === 'video' ? (
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{ uri: selectedMedia.media_url }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              onPlaybackStatusUpdate={(status: any) => {
                setPlaybackStatus({
                  isLoaded: status.isLoaded,
                  isPlaying: status.isPlaying || false,
                  positionMillis: status.positionMillis || 0,
                  durationMillis: status.durationMillis || 0,
                  volume: status.volume || 1.0,
                  isMuted: status.isMuted || false,
                });
              }}
            />
          ) : (
            <View style={styles.audioPlayer}>
              <Image 
                source={{ uri: selectedMedia?.thumbnail_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400' }} 
                style={styles.audioThumbnail} 
              />
              <Text style={styles.audioTitle}>{selectedMedia?.title}</Text>
              <Text style={styles.audioHost}>by {selectedMedia?.host}</Text>
              
              <View style={styles.audioControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <SkipBack size={24} color="#A1A1AA" strokeWidth={2} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.playPauseButton}
                  onPress={togglePlayback}>
                  {playbackStatus.isPlaying ? (
                    <Pause size={32} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton}>
                  <SkipForward size={24} color="#A1A1AA" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {Math.floor(playbackStatus.positionMillis / 60000)}:
                  {Math.floor((playbackStatus.positionMillis % 60000) / 1000).toString().padStart(2, '0')}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { 
                      width: playbackStatus.durationMillis > 0 
                        ? `${(playbackStatus.positionMillis / playbackStatus.durationMillis) * 100}%` 
                        : '0%' 
                    }
                  ]} />
                </View>
                <Text style={styles.timeText}>
                  {Math.floor(playbackStatus.durationMillis / 60000)}:
                  {Math.floor((playbackStatus.durationMillis % 60000) / 1000).toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );

  const renderCommentsModal = () => (
    <Modal visible={showCommentsModal} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comments</Text>
          <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.commentsContainer}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image 
                source={{ 
                  uri: comment.profiles?.avatar_url || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150'
                }} 
                style={styles.commentAvatar} 
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>
                  {comment.profiles?.full_name || 'Anonymous'}
                </Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentAction}>
                    <Heart 
                      size={14} 
                      color={comment.isLiked ? "#EF4444" : "#64748B"} 
                      strokeWidth={2}
                      fill={comment.isLiked ? "#EF4444" : "none"}
                    />
                    <Text style={styles.commentActionText}>{comment.likes_count}</Text>
                  </TouchableOpacity>
                  <Text style={styles.commentTime}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <BlurView intensity={20} style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#64748B"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.sendCommentButton}
            onPress={addComment}>
            <Send size={20} color="#7C3AED" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
          <Text style={styles.headerTitle}>Media Hub</Text>
          <Text style={styles.headerSubtitle}>Connect to Supabase to access media content</Text>
        </LinearGradient>
        <View style={styles.notConnectedContainer}>
          <Headphones size={48} color="#7C3AED" strokeWidth={2} />
          <Text style={styles.notConnectedText}>
            Please connect to Supabase to access media features
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Media Hub</Text>
              <Text style={styles.headerSubtitle}>Professional HR content & learning</Text>
            </View>
            <View style={styles.headerIcon}>
              <Headphones size={24} color="#3B82F6" strokeWidth={2} />
            </View>
          </View>
          
          <BlurView intensity={20} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search podcasts, videos..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#A1A1AA" strokeWidth={2} />
            </TouchableOpacity>
          </BlurView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
            style={styles.statsGradient}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Headphones size={20} color="#3B82F6" strokeWidth={2} />
                </View>
                <Text style={styles.statValue}>{mediaItems.filter(m => m.type === 'podcast').length}</Text>
                <Text style={styles.statLabel}>Podcasts</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <VideoIcon size={20} color="#EF4444" strokeWidth={2} />
                </View>
                <Text style={styles.statValue}>{mediaItems.filter(m => m.type === 'video').length}</Text>
                <Text style={styles.statLabel}>Videos</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <TrendingUp size={20} color="#10B981" strokeWidth={2} />
                </View>
                <Text style={styles.statValue}>
                  {mediaItems.reduce((sum, m) => sum + m.views_count, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Views</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading media content...</Text>
          </View>
        ) : filteredMedia.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Headphones size={48} color="#64748B" strokeWidth={2} />
            <Text style={styles.emptyText}>No media content found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
            </Text>
          </View>
        ) : (
          filteredMedia.map(renderMediaCard)
        )}
      </ScrollView>

      {renderPlayerModal()}
      {renderCommentsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F10',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryFilter: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(42, 42, 46, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  notConnectedText: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
  },
  mediaCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  mediaGradient: {
    backgroundColor: '#1A1A1D',
  },
  mediaHeader: {
    position: 'relative',
    height: 200,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaTypeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaContent: {
    padding: 20,
  },
  mediaInfo: {
    marginBottom: 16,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 24,
  },
  mediaHost: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  mediaDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  mediaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  mediaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoPlayer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  audioPlayer: {
    alignItems: 'center',
    width: '100%',
  },
  audioThumbnail: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  audioHost: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 32,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2A2A2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  commentTime: {
    fontSize: 12,
    color: '#71717A',
  },
  commentInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 29, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendCommentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
});