import { Sizes } from '@/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'bolode247@gmail.com';
const WHATSAPP_NUMBER = '237678064247'; // Replace with actual number

// Enable animation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'How do I apply for a job?',
    answer:
      "Open the job listing and tap on the 'Apply' button. You must have an updated profile to apply.",
  },
  {
    question: 'How do recruiters find me?',
    answer:
      'Recruiters can search for job seekers based on skills, location, and work category.',
  },
  {
    question: 'Is BOLO free to use?',
    answer: 'Yes, BOLO is currently free for both job seekers and recruiters.',
  },
];

const Support = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleWhatsAppPress = () => {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
  };

  const toggleFAQ = (index: number): void => {
    LayoutAnimation.easeInEaseOut();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        Need help using BOLO? We are here to assist. Contact us anytime!
      </Text>

      {/* CONTACT SECTION */}
      <Text style={styles.subHeading}>Contact Options</Text>

      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleWhatsAppPress}
      >
        <MaterialCommunityIcons name="whatsapp" size={22} />
        <Text style={styles.contactText}>Chat with us on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
        <MaterialCommunityIcons name="email" size={22} />
        <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
      </TouchableOpacity>

      {/* FAQ SECTION */}
      <Text style={styles.subHeading}>Frequently Asked Questions</Text>

      {faqs.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.faqItem}
          onPress={() => toggleFAQ(index)}
        >
          <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <MaterialCommunityIcons
              name={openIndex === index ? 'chevron-up' : 'chevron-down'}
              size={24}
            />
          </View>
          {openIndex === index && (
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BOLO App – Helping Careers Grow</Text>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Uniforge
        </Text>
      </View>
    </ScrollView>
  );
};

export default Support;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: Sizes.md,
    lineHeight: 22,
    color: '#444',
    marginBottom: 15,
    fontFamily: 'PoppinsSemiBold',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'PoppinsSemiBold',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  contactText: {
    fontSize: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#777',
  },
});
