import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'pages/login_page.dart';
import 'pages/recover_password.dart';
import 'pages/check_email_page.dart';

void main() {
  runApp(const KajamartApp());
}

class KajamartApp extends StatelessWidget {
  const KajamartApp({super.key});

  @override
  Widget build(BuildContext context) {
    const Color primaryColor = Color(0xFF00C853);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Kajamart',
      theme: ThemeData(
        primaryColor: primaryColor,
        scaffoldBackgroundColor: Colors.grey[100],
        fontFamily: 'Roboto',
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginPage(),
        '/recover': (context) => const RecoverPasswordPage(),
        '/check-email': (context) => const CheckEmailPage(),
        '/home': (context) => const HomeScreen(),
      },
    );
  }
}
