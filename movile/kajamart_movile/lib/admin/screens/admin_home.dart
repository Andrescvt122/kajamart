import 'package:flutter/material.dart';
import '../constants/app_constants.dart';
import '../services/data_service.dart';
import 'product_list.dart';
import 'profile_screen.dart';
import 'provider_list.dart';
import 'client_list.dart';
import 'sale_list.dart';
import 'purchase_list.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  _AdminHomeScreenState createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _selectedIndex = 0;

  final List<String> _titles = [
    'Productos',
    'Proveedores',
    'Ventas',
    'Compras',
    'Clientes',
    'Ver mi perfil',
    'Salir',
  ];

  final List<IconData> _icons = [
    Icons.inventory,
    Icons.business,
    Icons.point_of_sale,
    Icons.shopping_cart,
    Icons.people,
    Icons.person,
    Icons.logout,
  ];

  void _handleLogout() {
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/login',
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        title: Text(
          _titles[_selectedIndex],
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppConstants.primaryColor,
        elevation: 0,
      ),
      body: _buildScreenContent(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          if (index == 6) {
            // Logout - navegar al login
            _handleLogout();
          } else {
            setState(() {
              _selectedIndex = index;
            });
          }
        },
        selectedItemColor: AppConstants.primaryColor,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Productos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Proveedores',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.point_of_sale),
            label: 'Ventas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Compras',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Clientes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Ver mi perfil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.logout),
            label: 'Salir',
          ),
        ],
      ),
    );
  }

  Widget _buildScreenContent() {
    switch (_selectedIndex) {
      case 0:
        return _buildProductsScreen();
      case 1:
        return _buildProvidersScreen();
      case 2:
        return _buildSalesScreen();
      case 3:
        return _buildPurchasesScreen();
      case 4:
        return _buildClientsScreen();
      case 5:
        return _buildMyProfileScreen();
      default:
        return _buildProductsScreen();
    }
  }

  Widget _buildProvidersScreen() {
    return ProviderListScreen(providers: DataService.sampleProviders);
  }

  Widget _buildProductsScreen() {
    return ProductListScreen(products: DataService.sampleProducts);
  }

  Widget _buildSalesScreen() {
    return SaleListScreen(sales: DataService.sampleSales);
  }

  Widget _buildPurchasesScreen() {
    return PurchaseListScreen(purchases: DataService.samplePurchases);
  }

  Widget _buildClientsScreen() {
    return ClientListScreen(clients: DataService.sampleClients);
  }

  Widget _buildMyProfileScreen() {
    return const ProfileScreen();
  }
}
