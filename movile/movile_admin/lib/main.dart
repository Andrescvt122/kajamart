// lib/main.dart
import 'package:flutter/material.dart';
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

  // Datos quemados de ejemplo
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
          purchasePrice: null,
          salePrice: null,
          markupPercent: null,
          ivaPercent: null,
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
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
      ),
      // Rutas para las pantallas que usan Navigator.pushNamed(...)
      routes: {
        '/batches': (context) => const ProductBatchesScreen(),
        '/detail': (context) => const ProductDetailScreen(),
      },
      home: MainScreen(products: sampleProducts),
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

  // Nota: la primera pantalla usa la lista de productos quemados
  late final List<Widget> _screens = [
    ProductListScreen(products: widget.products),
    const Center(child: Text('Proveedores (pendiente)')),
    const Center(child: Text('Compras (pendiente)')),
    const Center(child: Text('Ventas (pendiente)')),
    const Center(child: Text('Clientes (pendiente)')),
    const Center(child: Text('Mi perfil (pendiente)')),
  ];

  void _onItemTapped(int index) => setState(() => _selectedIndex = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // El body muestra la pantalla según el tab seleccionado
      body: SafeArea(child: _screens[_selectedIndex]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.lightGreen[400], // verde claro característico
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.black87,
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
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Clientes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}
