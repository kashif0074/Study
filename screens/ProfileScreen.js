// screens/ProfileScreen.js (UPDATED WITH GLOBAL THEME)
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  
  // Responsive calculations
  const isSmallScreen = width < 375;
  const isTablet = width >= 768;
  const responsiveWidth = Math.min(width, 500);
  const scale = (size) => Math.min(width, 600) / 375 * size;
  const verticalScale = (size) => height / 812 * size;
  
  // Get theme from AuthContext
  const { 
    logout, 
    isGuest, 
    darkMode, 
    toggleDarkMode, 
    colors,
    user
  } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [accountModal, setAccountModal] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.displayName || "Sarah Johnson",
    email: user?.email || "sarah.j@university.edu",
    institution: "University of Technology",
    major: "Computer Science",
    year: "Junior",
    bio: "Passionate about AI and machine learning. Love sharing notes and helping fellow students succeed.",
    avatar: null,
  });

  const [editModal, setEditModal] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempMajor, setTempMajor] = useState(profile.major);
  const [tempBio, setTempBio] = useState(profile.bio);

  // Use colors from AuthContext
  const theme = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    subText: colors.subText,
    border: colors.border,
    primary: colors.primary,
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Allow access to photos to change avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfile({ ...profile, avatar: result.assets[0].uri });
    }
  };

  const saveProfile = () => {
    setProfile({ ...profile, name: tempName, major: tempMajor, bio: tempBio });
    setEditModal(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  if (isGuest) {
    return (
      <View style={[styles.container, { 
        backgroundColor: theme.bg, 
        justifyContent: "center", 
        alignItems: "center",
        paddingHorizontal: scale(20),
      }]}>
        <Ionicons name="lock-closed" size={scale(40)} color={theme.subText} style={{ marginBottom: verticalScale(15) }} />
        <Text style={[styles.name, { 
          color: theme.text, 
          fontSize: scale(18), 
          marginBottom: verticalScale(10),
          textAlign: 'center'
        }]}>
          Profile Not Available
        </Text>
        <Text style={{ 
          color: theme.subText, 
          fontSize: scale(14),
          textAlign: 'center',
          lineHeight: scale(20)
        }}>
          Please sign in to view your personalized profile, stats, and settings.
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
        
        {/* Header */}
        <LinearGradient
          colors={[theme.primary, theme.primary]}
          style={[
            styles.header,
            {
              paddingTop: verticalScale(isTablet ? 70 : isSmallScreen ? 40 : 50),
              paddingHorizontal: scale(isTablet ? 32 : isSmallScreen ? 16 : 24),
              paddingBottom: verticalScale(isTablet ? 40 : 32),
              borderBottomLeftRadius: scale(32),
              borderBottomRightRadius: scale(32),
            }
          ]}
        >
          <View style={styles.headerContent}>
            <Ionicons name="person" size={scale(isTablet ? 36 : isSmallScreen ? 28 : 32)} color="#fff" />
            <View style={{ marginLeft: scale(16) }}>
              <Text style={[
                styles.headerTitle,
                { fontSize: scale(isTablet ? 32 : isSmallScreen ? 24 : 28) }
              ]}>Profile</Text>
              <Text style={[
                styles.headerSubtitle,
                { fontSize: scale(isTablet ? 16 : isSmallScreen ? 13 : 15) }
              ]}>Your learning journey</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[
          styles.content,
          {
            paddingHorizontal: scale(isTablet ? 32 : isSmallScreen ? 16 : 20),
            marginTop: verticalScale(isTablet ? -30 : isSmallScreen ? -15 : -20),
            maxWidth: responsiveWidth,
            alignSelf: 'center',
            width: '100%',
          }
        ]}>
          
          {/* Profile Card */}
          <View style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: scale(20),
              padding: scale(isTablet ? 28 : isSmallScreen ? 20 : 24),
              marginBottom: verticalScale(isTablet ? 24 : isSmallScreen ? 16 : 20),
            }
          ]}>
            
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile.avatar ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={[
                    styles.avatarImage,
                    {
                      width: scale(isTablet ? 120 : isSmallScreen ? 80 : 96),
                      height: scale(isTablet ? 120 : isSmallScreen ? 80 : 96),
                      borderRadius: scale(isTablet ? 60 : isSmallScreen ? 40 : 48),
                      borderWidth: scale(4),
                    }
                  ]} 
                />
              ) : (
                <View style={[
                  styles.avatar,
                  {
                    width: scale(isTablet ? 120 : isSmallScreen ? 80 : 96),
                    height: scale(isTablet ? 120 : isSmallScreen ? 80 : 96),
                    borderRadius: scale(isTablet ? 60 : isSmallScreen ? 40 : 48),
                    borderWidth: scale(4),
                  }
                ]}>
                  <Text style={[
                    styles.avatarText,
                    { fontSize: scale(isTablet ? 40 : isSmallScreen ? 28 : 32) }
                  ]}>
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={[
                styles.cameraBtn,
                {
                  width: scale(isTablet ? 44 : isSmallScreen ? 32 : 36),
                  height: scale(isTablet ? 44 : isSmallScreen ? 32 : 36),
                  borderRadius: scale(isTablet ? 22 : isSmallScreen ? 16 : 18),
                  borderWidth: scale(3),
                }
              ]} onPress={pickImage}>
                <Ionicons name="camera" size={scale(isTablet ? 22 : isSmallScreen ? 16 : 18)} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[
              styles.name,
              { 
                color: theme.text,
                fontSize: scale(isTablet ? 26 : isSmallScreen ? 18 : 22),
                marginBottom: verticalScale(4),
              }
            ]}>{profile.name}</Text>
            
            <Text style={[
              styles.email,
              { 
                color: theme.subText,
                fontSize: scale(isTablet ? 16 : isSmallScreen ? 13 : 15),
                marginBottom: verticalScale(4),
              }
            ]}>{profile.email}</Text>
            
            <Text style={[
              styles.institution,
              { 
                color: theme.subText,
                fontSize: scale(isTablet ? 14 : isSmallScreen ? 12 : 13),
              }
            ]}>{profile.institution} • {profile.major}</Text>

            <View style={[
              styles.divider,
              {
                backgroundColor: theme.border,
                height: 1,
                marginVertical: verticalScale(isTablet ? 24 : isSmallScreen ? 16 : 20),
                width: '100%',
              }
            ]} />

            <Text style={[
              styles.bioLabel,
              { 
                color: theme.text,
                fontSize: scale(isTablet ? 18 : isSmallScreen ? 14 : 16),
                marginBottom: verticalScale(8),
              }
            ]}>Bio</Text>
            
            <Text style={[
              styles.bio,
              { 
                color: theme.subText,
                fontSize: scale(isTablet ? 16 : isSmallScreen ? 13 : 14),
                lineHeight: scale(isTablet ? 26 : isSmallScreen ? 20 : 22),
              }
            ]}>{profile.bio}</Text>
            
            <TouchableOpacity 
              style={[
                styles.editBtn,
                {
                  padding: scale(isTablet ? 14 : isSmallScreen ? 8 : 10),
                  borderRadius: scale(12),
                  marginTop: verticalScale(isTablet ? 24 : isSmallScreen ? 16 : 20),
                  backgroundColor: darkMode ? colors.card : '#E5E7EB',
                }
              ]} 
              onPress={() => {
                setTempName(profile.name);
                setTempMajor(profile.major);
                setTempBio(profile.bio);
                setEditModal(true);
              }}
            >
              <Ionicons name="create-outline" size={scale(isTablet ? 24 : isSmallScreen ? 18 : 20)} color={theme.primary} />
              <Text style={[
                styles.editBtnText,
                {
                  marginLeft: scale(8),
                  fontSize: scale(isTablet ? 16 : isSmallScreen ? 13 : 15),
                  color: theme.primary,
                }
              ]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Settings */}
          <View style={[
            styles.settingsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: scale(20),
              padding: scale(isTablet ? 24 : isSmallScreen ? 16 : 20),
              marginBottom: verticalScale(isTablet ? 24 : isSmallScreen ? 16 : 20),
            }
          ]}>
            <Text style={[
              styles.cardTitle,
              {
                color: theme.text,
                fontSize: scale(isTablet ? 20 : isSmallScreen ? 16 : 18),
                marginBottom: verticalScale(isTablet ? 20 : isSmallScreen ? 12 : 16),
              }
            ]}>Settings</Text>

            <View style={[
              styles.settingRow,
              {
                backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                padding: scale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                borderRadius: scale(16),
                marginBottom: verticalScale(isTablet ? 16 : isSmallScreen ? 10 : 12),
              }
            ]}>
              <View style={[styles.settingLeft, { gap: scale(14) }]}>
                <Ionicons name="notifications-outline" size={scale(isTablet ? 26 : isSmallScreen ? 20 : 22)} color={theme.subText} />
                <Text style={[
                  styles.settingLabel,
                  {
                    color: theme.text,
                    fontSize: scale(isTablet ? 16 : isSmallScreen ? 14 : 15),
                  }
                ]}>Push Notifications</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications} 
                thumbColor={notifications ? colors.primary : colors.subText}
              />
            </View>

            <View style={[
              styles.settingRow,
              {
                backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                padding: scale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                borderRadius: scale(16),
                marginBottom: verticalScale(isTablet ? 16 : isSmallScreen ? 10 : 12),
              }
            ]}>
              <View style={[styles.settingLeft, { gap: scale(14) }]}>
                <Ionicons name="moon-outline" size={scale(isTablet ? 26 : isSmallScreen ? 20 : 22)} color={theme.subText} />
                <Text style={[
                  styles.settingLabel,
                  {
                    color: theme.text,
                    fontSize: scale(isTablet ? 16 : isSmallScreen ? 14 : 15),
                  }
                ]}>Dark Mode</Text>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={toggleDarkMode} 
                thumbColor={darkMode ? colors.primary : colors.subText} 
              />
            </View>

            {/* Account Settings Button */}
            <TouchableOpacity 
              style={[
                styles.accountSettingsBtn,
                {
                  backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                  padding: scale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                  borderRadius: scale(16),
                }
              ]}
              onPress={() => setAccountModal(true)}
            >
              <View style={[styles.settingLeft, { gap: scale(14) }]}>
                <Ionicons name="person-outline" size={scale(isTablet ? 26 : isSmallScreen ? 20 : 22)} color={theme.subText} />
                <Text style={[
                  styles.settingLabel,
                  {
                    color: theme.text,
                    fontSize: scale(isTablet ? 16 : isSmallScreen ? 14 : 15),
                  }
                ]}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(isTablet ? 24 : isSmallScreen ? 18 : 20)} color={theme.subText} />
            </TouchableOpacity>
          </View>

          {/* Log Out */}
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: theme.card,
                borderColor: "#FECACA",
                padding: verticalScale(isTablet ? 22 : isSmallScreen ? 16 : 18),
                borderRadius: scale(16),
                marginBottom: verticalScale(isTablet ? 40 : isSmallScreen ? 30 : 30),
              }
            ]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={scale(isTablet ? 26 : isSmallScreen ? 20 : 22)} color="#EF4444" />
            <Text style={[
              styles.logoutText,
              {
                marginLeft: scale(10),
                fontSize: scale(isTablet ? 18 : isSmallScreen ? 14 : 16),
              }
            ]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.card,
              width: responsiveWidth * 0.9,
              maxWidth: 450,
              borderRadius: scale(20),
              padding: scale(isTablet ? 28 : isSmallScreen ? 20 : 24),
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                color: theme.text,
                fontSize: scale(isTablet ? 26 : isSmallScreen ? 20 : 22),
                marginBottom: verticalScale(24),
              }
            ]}>Edit Profile</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                  height: verticalScale(isTablet ? 64 : isSmallScreen ? 50 : 56),
                  borderRadius: scale(16),
                  paddingHorizontal: scale(16),
                  fontSize: scale(isTablet ? 18 : isSmallScreen ? 15 : 16),
                  marginBottom: verticalScale(16),
                }
              ]}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Full Name"
              placeholderTextColor={theme.subText}
            />
            
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                  height: verticalScale(isTablet ? 64 : isSmallScreen ? 50 : 56),
                  borderRadius: scale(16),
                  paddingHorizontal: scale(16),
                  fontSize: scale(isTablet ? 18 : isSmallScreen ? 15 : 16),
                  marginBottom: verticalScale(16),
                }
              ]}
              value={tempMajor}
              onChangeText={setTempMajor}
              placeholder="Major"
              placeholderTextColor={theme.subText}
            />
            
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                {
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                  height: verticalScale(isTablet ? 160 : isSmallScreen ? 100 : 120),
                  borderRadius: scale(16),
                  paddingHorizontal: scale(16),
                  paddingTop: scale(16),
                  fontSize: scale(isTablet ? 18 : isSmallScreen ? 15 : 16),
                }
              ]}
              value={tempBio}
              onChangeText={setTempBio}
              placeholder="Bio"
              placeholderTextColor={theme.subText}
              multiline
            />

            <View style={[
              styles.modalButtons,
              { marginTop: verticalScale(isTablet ? 28 : isSmallScreen ? 20 : 20) }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.cancelBtn,
                  {
                    padding: verticalScale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                    borderRadius: scale(16),
                    marginRight: scale(10),
                  }
                ]} 
                onPress={() => setEditModal(false)}
              >
                <Text style={[
                  styles.cancelText,
                  { fontSize: scale(isTablet ? 18 : isSmallScreen ? 14 : 16) }
                ]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveBtn,
                  {
                    padding: verticalScale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                    borderRadius: scale(16),
                    marginLeft: scale(10),
                  }
                ]} 
                onPress={saveProfile}
              >
                <Text style={[
                  styles.saveText,
                  { fontSize: scale(isTablet ? 18 : isSmallScreen ? 14 : 16) }
                ]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Settings Modal */}
      <Modal visible={accountModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.card,
              width: responsiveWidth * 0.9,
              maxWidth: 450,
              borderRadius: scale(20),
              padding: scale(isTablet ? 28 : isSmallScreen ? 20 : 24),
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                color: theme.text,
                fontSize: scale(isTablet ? 26 : isSmallScreen ? 20 : 22),
                marginBottom: verticalScale(24),
              }
            ]}>Account Information</Text>

            <View style={styles.accountInfoSection}>
              <View style={styles.accountInfoRow}>
                <Ionicons name="person-outline" size={scale(20)} color={theme.primary} />
                <View style={styles.accountInfoText}>
                  <Text style={[
                    styles.accountInfoLabel,
                    { color: theme.subText, fontSize: scale(14) }
                  ]}>Name</Text>
                  <Text style={[
                    styles.accountInfoValue,
                    { color: theme.text, fontSize: scale(16) }
                  ]}>{profile.name}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.accountInfoRow}>
                <Ionicons name="mail-outline" size={scale(20)} color={theme.primary} />
                <View style={styles.accountInfoText}>
                  <Text style={[
                    styles.accountInfoLabel,
                    { color: theme.subText, fontSize: scale(14) }
                  ]}>Email</Text>
                  <Text style={[
                    styles.accountInfoValue,
                    { color: theme.text, fontSize: scale(16) }
                  ]}>{profile.email}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.accountInfoRow}>
                <Ionicons name="school-outline" size={scale(20)} color={theme.primary} />
                <View style={styles.accountInfoText}>
                  <Text style={[
                    styles.accountInfoLabel,
                    { color: theme.subText, fontSize: scale(14) }
                  ]}>Institution</Text>
                  <Text style={[
                    styles.accountInfoValue,
                    { color: theme.text, fontSize: scale(16) }
                  ]}>{profile.institution}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.accountInfoRow}>
                <Ionicons name="book-outline" size={scale(20)} color={theme.primary} />
                <View style={styles.accountInfoText}>
                  <Text style={[
                    styles.accountInfoLabel,
                    { color: theme.subText, fontSize: scale(14) }
                  ]}>Major & Year</Text>
                  <Text style={[
                    styles.accountInfoValue,
                    { color: theme.text, fontSize: scale(16) }
                  ]}>{profile.major} • {profile.year}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.accountInfoRow}>
                <Ionicons name="document-text-outline" size={scale(20)} color={theme.primary} />
                <View style={styles.accountInfoText}>
                  <Text style={[
                    styles.accountInfoLabel,
                    { color: theme.subText, fontSize: scale(14) }
                  ]}>Bio</Text>
                  <Text style={[
                    styles.accountInfoValue,
                    { color: theme.text, fontSize: scale(16), lineHeight: scale(22) }
                  ]}>{profile.bio}</Text>
                </View>
              </View>
            </View>

            <View style={[
              styles.modalButtons,
              { marginTop: verticalScale(isTablet ? 28 : isSmallScreen ? 20 : 20) }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.closeBtn,
                  {
                    padding: verticalScale(isTablet ? 20 : isSmallScreen ? 14 : 16),
                    borderRadius: scale(16),
                    backgroundColor: darkMode ? "#374151" : "#E5E7EB",
                  }
                ]} 
                onPress={() => setAccountModal(false)}
              >
                <Text style={[
                  styles.closeText,
                  { 
                    fontSize: scale(isTablet ? 18 : isSmallScreen ? 14 : 16),
                    color: theme.text
                  }
                ]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontWeight: "800", color: "#fff" },
  headerSubtitle: { color: "#E0E7FF", marginTop: 4 },
  content: { paddingBottom: 20 },
  profileCard: { alignItems: "center", borderWidth: 1 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { backgroundColor: "#6B21A8", justifyContent: "center", alignItems: "center", borderColor: "#fff" },
  avatarImage: { borderColor: "#fff" },
  avatarText: { color: "#fff", fontWeight: "700" },
  cameraBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#6B21A8", justifyContent: "center", alignItems: "center", borderColor: "#fff" },
  name: { fontWeight: "700", textAlign: 'center' },
  email: { textAlign: 'center' },
  institution: { textAlign: 'center' },
  major: {},
  divider: { height: 1, width: '100%' },
  bioLabel: { fontWeight: "600", alignSelf: 'flex-start' },
  bio: { textAlign: 'left', width: '100%' },
  editBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  editBtnText: { fontWeight: '600' },
  settingsCard: { borderWidth: 1 },
  cardTitle: { fontWeight: "700" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingLabel: {},
  accountSettingsBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1 },
  logoutText: { fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  modalContent: {},
  modalTitle: { textAlign: "center", fontWeight: "700" },
  input: { borderWidth: 1 },
  bioInput: { textAlignVertical: "top" },
  modalButtons: { flexDirection: "row" },
  cancelBtn: { backgroundColor: "#94A3B8", flex: 1 },
  cancelText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  saveBtn: { backgroundColor: "#6B21A8", flex: 1 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  closeBtn: { flex: 1 },
  closeText: { textAlign: "center", fontWeight: "600" },
  accountInfoSection: { marginBottom: 20 },
  accountInfoRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 12 },
  accountInfoText: { flex: 1, marginLeft: 12 },
  accountInfoLabel: { fontWeight: '500' },
  accountInfoValue: { fontWeight: '600', marginTop: 4 },
});