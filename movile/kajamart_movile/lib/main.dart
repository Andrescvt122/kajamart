import 'package:flutter/material.dart';
import 'client/screens/home_screen.dart';
import 'client/pages/login_page.dart';
import 'client/pages/recover_password.dart';
import 'client/pages/check_email_page.dart';
import 'admin/screens/admin_home.dart';
import 'admin/screens/provider_detail.dart';
import 'admin/screens/product_batches.dart';
import 'admin/models/provider.dart';
import 'admin/models/product.dart';

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
        '/admin-home': (context) => const AdminHomeScreen(),
        '/provider-detail': (context) {
          final args = ModalRoute.of(context)!.settings.arguments;
          if (args != null && args is Provider) {
            return ProviderDetailScreen(provider: args);
          }
          return const ProviderDetailScreen();
        },
        '/batches': (context) {
          final args = ModalRoute.of(context)!.settings.arguments;
          if (args != null && args is Product) {
            return ProductBatchesScreen();
          }
          return const ProductBatchesScreen();
        },
      },
    );
  }
}
