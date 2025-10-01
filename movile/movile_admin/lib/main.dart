// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/app_constants.dart';
import 'services/product_service.dart';
import 'services/navigation_service.dart';
import 'services/provider_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => ProductService()),
        ChangeNotifierProvider(create: (context) => ProviderService()),
      ],
      child: MaterialApp(
        title: AppConstants.appTitle,
        debugShowCheckedModeBanner: false,
        theme: _buildAppTheme(),
        home: const MainScreen(),
      ),
    );
  }

  ThemeData _buildAppTheme() {
    return ThemeData(
      primarySwatch:
          MaterialColor(AppConstants.primaryColor.value, <int, Color>{
            50: AppConstants.primaryColor.withOpacity(0.1),
            100: AppConstants.primaryColor.withOpacity(0.2),
            200: AppConstants.primaryColor.withOpacity(0.3),
            300: AppConstants.primaryColor.withOpacity(0.4),
            400: AppConstants.primaryColor.withOpacity(0.5),
            500: AppConstants.primaryColor.withOpacity(0.6),
            600: AppConstants.primaryColor.withOpacity(0.7),
            700: AppConstants.primaryColor.withOpacity(0.8),
            800: AppConstants.primaryColor.withOpacity(0.9),
            900: AppConstants.primaryColor,
          }),
      scaffoldBackgroundColor: AppConstants.backgroundColor,
      useMaterial3: true,
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

  final List<GlobalKey<NavigatorState>> _navigatorKeys =
      NavigationService.createNavigatorKeys();

  void _onItemTapped(int index) {
    if (_selectedIndex == index) {
      _navigatorKeys[index].currentState!.popUntil((r) => r.isFirst);
    } else {
      setState(() => _selectedIndex = index);
    }
  }

  Widget _buildOffstageNavigator(int index) {
    String initialRoute;
    switch (index) {
      case 0:
        initialRoute = '/'; // productos
        break;
      case 1:
        initialRoute = '/suppliers'; // proveedores
        break;
      case 2:
        initialRoute = '/purchases';
        break;
      case 3:
        initialRoute = '/sales';
        break;
      case 4:
        initialRoute = '/clients';
        break;
      case 5:
        initialRoute = '/profile';
        break;
      default:
        initialRoute = '/';
    }

    return Offstage(
      offstage: _selectedIndex != index,
      child: Navigator(
        key: _navigatorKeys[index],
        initialRoute: initialRoute, // 👈 aquí está el cambio clave
        onGenerateRoute: (settings) {
          return NavigationService.onGenerateRoute(settings, context) ??
              MaterialPageRoute(
                builder: (_) => const Scaffold(
                  body: Center(child: Text('Página no encontrada')),
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
        children: List.generate(
          AppConstants.navigationItemCount,
          (index) => _buildOffstageNavigator(index),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppConstants.secondaryColor,
        selectedItemColor: AppConstants.textDarkColor,
        unselectedItemColor: AppConstants.textLightColor,
        onTap: _onItemTapped,
        items: NavigationService.getNavigationItems(),
      ),
    );
  }
}
