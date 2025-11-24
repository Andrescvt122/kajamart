// lib/main.dart
import 'package:flutter/material.dart';
import 'package:movile_admin/constants/app_constants.dart';
import 'package:movile_admin/pages/check_email_page.dart';
import 'package:movile_admin/pages/login_page.dart';
import 'package:movile_admin/pages/recover_password.dart';
import 'package:provider/provider.dart';

import 'models/product.dart';
import 'screens/product_list.dart';
import 'screens/product_batches.dart';
import 'screens/product_detail.dart';
import 'screens/profile_screen.dart';
import 'services/product_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProductService()),
      ],
      child: MaterialApp(
        title: 'Admin - Inventario',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppConstants.primaryColor,
            background: AppConstants.backgroundColor,
          ),
          scaffoldBackgroundColor: AppConstants.backgroundColor,
          useMaterial3: true,
        ),
        initialRoute: '/login',
        routes: {
          '/login': (context) => const LoginPage(),
          '/home': (context) => const MainScreen(),
          '/recover': (context) => const RecoverPasswordPage(),
          '/check-email': (context) => const CheckEmailPage(),
        },
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<GlobalKey<NavigatorState>> _navigatorKeys = List.generate(
    7, // Aumentamos a 7 para coincidir con los items, aunque el último no se use para un Offstage.
    (_) => GlobalKey<NavigatorState>(),
  );

  void _onItemTapped(int index) {
    if (index == 6) {
      // Índice del botón "Salir"
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      return;
    }
    // Aseguramos que el índice esté dentro de los límites de los navigator keys.
    if (_selectedIndex == index && index < _navigatorKeys.length) {
      _navigatorKeys[index].currentState!.popUntil((r) => r.isFirst);
    } else {
      setState(() => _selectedIndex = index);
    }
  }

  Widget _buildOffstageNavigator(int index) {
    // No se construye un navigator para el botón de salir.
    if (index >= 6) {
      // El índice 6 es 'Salir' y no tiene vista.
      return Container();
    }
    return Offstage(
      offstage: _selectedIndex != index,
      child: Navigator(
        key: _navigatorKeys[index],
        onGenerateRoute: (settings) {
          if (index == 0) {
            // Sección Productos
            if (settings.name == '/batches') {
              final product = settings.arguments as Product;
              return MaterialPageRoute(
                builder: (_) => const ProductBatchesScreen(),
                settings: RouteSettings(
                  name: settings.name,
                  arguments: product,
                ),
              );
            }
            if (settings.name == '/detail') {
              final args = settings.arguments as Map<String, dynamic>;
              return MaterialPageRoute(
                builder: (_) => const ProductDetailScreen(),
                settings: RouteSettings(name: settings.name, arguments: args),
              );
            }
            return MaterialPageRoute(
              builder: (_) => const ProductListScreen(),
            );
          }

          if (index == 5) {
            // Sección Perfil
            return MaterialPageRoute(builder: (_) => const ProfileScreen());
          }

          // Otras secciones todavía no implementadas
          return MaterialPageRoute(
            builder: (_) => Scaffold(
              backgroundColor: AppConstants.backgroundColor,
              body: Center(
                child: Text(
                  'Sección $index en construcción',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: Color(0xff343b45),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        // Generamos 6 vistas (0 a 5) para los OffstageNavigators.
        // El item 6 (Salir) no tiene vista.
        children: List.generate(6, (index) => _buildOffstageNavigator(index)),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppConstants.backgroundColor,
        selectedItemColor: const Color(
          0xff343b45,
        ), // Texto oscuro al seleccionar
        unselectedItemColor: const Color(0xff626762), // Gris oscuro
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag),
            label: 'Productos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.local_shipping),
            label: 'Proveedores',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Compras',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.point_of_sale),
            label: 'Ventas',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Clientes'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
          BottomNavigationBarItem(
            icon: Icon(Icons.exit_to_app),
            label: 'Salir',
          ),
        ],
      ),
    );
  }
}
