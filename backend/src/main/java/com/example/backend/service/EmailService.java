package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.lang.module.Configuration;

@Service
@Slf4j
public class EmailService {
	@Autowired
	private JavaMailSender javaMailSender;

	/**
	 * Sends an email with optional HTML content and attachment.
	 *
	 * @param to      The recipient's email address.
	 * @param subject The subject of the email.
	 * @param text    The body of the email, can be HTML or plain text.
	 * @param isHtml  Whether the email body is HTML or plain text.
	 */
	public void sendEmail(String to, String subject, String text, boolean isHtml) {
		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);

			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(text, isHtml);

			javaMailSender.send(message);
			log.info("Email sent successfully to {}", to);

		} catch (MessagingException e) {
			log.error("Failed to send email to {}", to, e);
			// Handle the exception (retry logic, save to dlq...)
		}
	}

}
