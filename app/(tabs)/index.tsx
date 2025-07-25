import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, Heart, MessageCircle, Share, TrendingUp, X, Send, Search, Sparkles, Users, Award, Zap } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase, Post, PostComment, isSupabaseConfigured } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface PostWithProfile extends Post {
  profiles: {
    full_name: string;
    avatar_url: string;
    company: string;
    job_title: string;
  };
  isLiked?: boolean;
  comments?: PostComment[];
}

const CATEGORIES = [
  'All',
  'Labor Law',
  'People Strategy', 
  'Compliance',
  'Analytics',
  'General'
];

const CATEGORY_COLORS = {
  'Labor Law': '#7C3AED',
  'People Strategy': '#10B981',
  'Compliance': '#F59E0B',
  'Analytics': '#EF4444',
  'General': '#3B82F6',
};

export default function CommunityScreen() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithProfile | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [user, selectedCategory]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url,
            company,
            job_title
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...post,
            isLiked: !!likeData
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isSupabaseConfigured || !user) {
      Alert.alert('Error', 'Please sign in to create posts');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          author_id: user.id
        });

      if (error) throw error;

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('General');
      setShowCreateModal(false);
      loadPosts();
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    if (!isSupabaseConfigured || !user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes_count: p.isLiked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost || !user) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: selectedPost.id,
          author_id: user.id,
          content: newComment
        });

      if (error) throw error;

      setNewComment('');
      loadComments(selectedPost.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const openComments = (post: PostWithProfile) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
    loadComments(post.id);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.statsGradient}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Users size={20} color="#7C3AED" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>2.4k</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Award size={20} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>847</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Zap size={20} color="#F59E0B" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>95%</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderPost = (post: PostWithProfile) => (
    <View key={post.id} style={styles.postCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.postGradient}>
        
        <View style={styles.postHeader}>
          <Image 
            source={{ 
              uri: post.profiles?.avatar_url || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150'
            }} 
            style={styles.avatar} 
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {post.profiles?.full_name || 'Anonymous User'}
            </Text>
            <View style={styles.metaInfo}>
              <View style={[
                styles.categoryBadge,
                { 
                  backgroundColor: `${CATEGORY_COLORS[post.category] || '#3B82F6'}20`,
                  borderColor: CATEGORY_COLORS[post.category] || '#3B82F6'
                }
              ]}>
                <Text style={[
                  styles.categoryText,
                  { color: CATEGORY_COLORS[post.category] || '#3B82F6' }
                ]}>
                  {post.category}
                </Text>
              </View>
              <Text style={styles.timeAgo}>
                {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>
            {post.profiles?.company && (
              <Text style={styles.companyText}>
                {post.profiles.job_title} at {post.profiles.company}
              </Text>
            )}
          </View>
        </View>
        
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleLike(post.id)}>
            <Heart 
              size={18} 
              color={post.isLiked ? "#EF4444" : "#64748B"} 
              strokeWidth={2}
              fill={post.isLiked ? "#EF4444" : "none"}
            />
            <Text style={[styles.actionText, post.isLiked && { color: "#EF4444" }]}>
              {post.likes_count}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openComments(post)}>
            <MessageCircle size={18} color="#64748B" strokeWidth={2} />
            <Text style={styles.actionText}>{post.comments_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={18} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet">
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.modalContainer}>
        
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Post</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categorySelector}>
                {CATEGORIES.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newPostCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setNewPostCategory(category)}>
                    <Text style={[
                      styles.categoryOptionText,
                      newPostCategory === category && styles.categoryOptionTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your post about?"
              placeholderTextColor="#64748B"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your insights, questions, or experiences..."
              placeholderTextColor="#64748B"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={1000}
            />
          </View>
        </ScrollView>

        <BlurView intensity={20} style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCreateModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={createPost}>
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              style={styles.createButtonGradient}>
              <Text style={styles.createButtonText}>Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  const renderCommentsModal = () => (
    <Modal
      visible={showCommentsModal}
      animationType="slide"
      presentationStyle="pageSheet">
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.modalContainer}>
        
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
                <Text style={styles.commentTime}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </Text>
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
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              style={styles.sendButtonGradient}>
              <Send size={20} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
          <Text style={styles.headerTitle}>HR Community</Text>
          <Text style={styles.headerSubtitle}>Connect to Supabase to access the community</Text>
        </LinearGradient>
        <View style={styles.notConnectedContainer}>
          <Sparkles size={48} color="#7C3AED" strokeWidth={2} />
          <Text style={styles.notConnectedText}>
            Please connect to Supabase to access community features
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0B', '#1A1A1D', '#2A1A3D']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>HR Community</Text>
              <Text style={styles.headerSubtitle}>Learn, Share, Grow Together</Text>
            </View>
            <View style={styles.headerIcon}>
              <Sparkles size={24} color="#A855F7" strokeWidth={2} />
            </View>
          </View>
          
          <BlurView intensity={20} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search discussions..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
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
        
        {renderStatsHeader()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Sparkles size={32} color="#7C3AED" strokeWidth={2} />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color="#64748B" strokeWidth={2} />
            <Text style={styles.emptyText}>No posts found</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
          </View>
        ) : (
          filteredPosts.map(renderPost)
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}>
        <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.fabGradient}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </TouchableOpacity>

      {renderCreatePostModal()}
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
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
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
    backgroundColor: '#7C3AED',
    borderColor: '#A855F7',
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
  postCard: {
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
  postGradient: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  companyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    color: '#A1A1AA',
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    backgroundColor: 'rgba(42, 42, 46, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryOptionActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A855F7',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  titleInput: {
    backgroundColor: 'rgba(26, 26, 29, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentInput: {
    backgroundColor: 'rgba(26, 26, 29, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 46, 0.8)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
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
    marginBottom: 4,
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
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});