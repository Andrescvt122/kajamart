// lib/main.dart
import 'package:flutter/material.dart';
import 'package:movile_admin/pages/check_email_page.dart';
import 'package:movile_admin/pages/login_page.dart';
import 'package:movile_admin/pages/recover_password.dart';
import 'models/product.dart';
import 'models/batch.dart';
import 'screens/product_list.dart';
import 'screens/product_batches.dart';
import 'screens/product_detail.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // Datos de ejemplo
  List<Product> get sampleProducts => [
    Product(
      id: 'L001',
      name: 'Leche Entera 1L',
      category: 'Lácteos',
      imageUrl: 'https://images.unsplash.com/photo-1585238342022-7a1f2a1f8f7a',
      currentStock: 76,
      minStock: 50,
      maxStock: 500,
      price: 3200.0,
      status: 'Activo',
      batches: [
        Batch(
          idDetalle: 'B-1001',
          barcode: '987654321001',
          expiryDate: DateTime(2024, 12, 1),
          quantity: 20,
          consumedStock: 4,
          price: 3200.0,
        ),
        Batch(
          idDetalle: 'B-1002',
          barcode: '987654321002',
          expiryDate: DateTime(2025, 2, 15),
          quantity: 56,
          consumedStock: 0,
          price: 3200.0,
        ),
      ],
    ),
    Product(
      id: 'C002',
      name: 'Cereal Maíz 500g',
      category: 'Cereales',
      imageUrl: 'https://images.unsplash.com/photo-1604908177542-6f3f9b9f9e2b',
      currentStock: 120,
      minStock: 20,
      maxStock: 300,
      price: 9800.0,
      status: 'Activo',
      purchasePrice: 7000.0,
      salePrice: 9800.0,
      markupPercent: 40.0,
      ivaPercent: 19.0,
      batches: [
        Batch(
          idDetalle: 'B-2001',
          barcode: '123456789012',
          expiryDate: DateTime(2025, 6, 1),
          quantity: 100,
          consumedStock: 10,
          price: 9800.0,
        ),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Admin - Inventario',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.green, useMaterial3: true),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginPage(),
        '/home': (context) => MainScreen(products: sampleProducts),
        '/recover': (context) => const RecoverPasswordPage(),
        '/check-email': (context) => const CheckEmailPage(),
      },
    );
  }
}

class MainScreen extends StatefulWidget {
  final List<Product> products;
  const MainScreen({super.key, required this.products});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<GlobalKey<NavigatorState>> _navigatorKeys = List.generate(
    6,
    (_) => GlobalKey<NavigatorState>(),
  );

  void _onItemTapped(int index) {
    if (index == 6) {
      // Índice del botón "Salir"
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      return;
    }
    if (_selectedIndex == index) {
      _navigatorKeys[index].currentState!.popUntil((r) => r.isFirst);
    } else {
      setState(() => _selectedIndex = index);
    }
  }

  Widget _buildOffstageNavigator(int index) {
    // No se construye un navigator para el botón de salir.
    if (index >= _navigatorKeys.length) {
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
              builder: (_) => ProductListScreen(products: widget.products),
            );
          }

          // Otras secciones todavía no implementadas
          return MaterialPageRoute(
            builder: (_) => Scaffold(
              backgroundColor: const Color(0xffe8e5dc),
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
        children: List.generate(6, (index) => _buildOffstageNavigator(index)),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xffb4debf), // Verde claro
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