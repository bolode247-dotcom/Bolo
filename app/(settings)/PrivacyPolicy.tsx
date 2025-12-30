import { Colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicy = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:bolode247@gmail.com');
  };

  interface SectionProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    children?: React.ReactNode;
  }

  const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: October 2025</Text>

        <Text style={styles.intro}>
          BOLO is a recruitment platform owned by Uniforge. By using BOLO, you
          agree to the practices described in this policy.
        </Text>

        <Section icon="information-circle" title="1. Information We Collect">
          We may collect personal details such as your name, email, phone
          number, professional information, work samples, and account activity.
          No payment or salary data is collected.
        </Section>

        <Section icon="briefcase" title="2. How We Use Your Data">
          To match job seekers with recruiters, enable messaging, improve
          service quality, communicate updates, and ensure safety.
        </Section>

        <Section icon="people" title="3. Who Can See Your Information">
          Recruiters can view job seeker profiles and work samples. Job seekers
          can view job listings. Messages are private but may be reviewed if
          legally required.
        </Section>

        <Section icon="shield-checkmark" title="4. Your Rights">
          You may access, update, or delete your data anytime. You can also
          withdraw consent and request communication opt-out.
        </Section>

        <Section icon="lock-closed" title="5. Data Storage & Security">
          Data is securely stored using Appwrite services in Cameroon or nearby
          secure regions, protected with encryption and access controls.
        </Section>

        <Section icon="time" title="6. Data Retention">
          Data is retained while your account is active and up to 12 months
          after deletion unless required for fraud prevention or legal
          compliance.
        </Section>

        <Section icon="alert-circle" title="7. Age Requirement">
          BOLO is for users aged 16 and above. Users under 18 must ensure
          guardian approval for job applications.
        </Section>

        <Section icon="settings" title="8. Policy Updates">
          We may update this policy at any time and will notify users of major
          changes within the app.
        </Section>

        <Section icon="mail" title="9. Contact Us">
          If you have concerns about your privacy or need assistance, contact
          us:
        </Section>

        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.email}>Email: bolode247@gmail.com</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>© Uniforge — All Rights Reserved</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 16,
  },
  intro: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    paddingLeft: 26,
  },
  email: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingLeft: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
});
