import 'dart:convert';
import 'dart:io';

class MarketplaceTransport {
  const MarketplaceTransport({this.timeout = const Duration(seconds: 8)});

  final Duration timeout;

  Future<String> get(Uri uri) async {
    final client = HttpClient()..connectionTimeout = timeout;

    try {
      final request = await client.getUrl(uri).timeout(timeout);
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');

      final response = await request.close().timeout(timeout);
      final body = await utf8.decoder.bind(response).join().timeout(timeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException(
          'GET $uri failed with status ${response.statusCode}: $body',
          uri: uri,
        );
      }

      return body;
    } finally {
      client.close(force: true);
    }
  }

  Future<String> post(
    Uri uri, {
    required Object body,
    Map<String, String> headers = const {},
  }) async {
    final client = HttpClient()..connectionTimeout = timeout;

    try {
      final request = await client.postUrl(uri).timeout(timeout);
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      request.headers.set(HttpHeaders.contentTypeHeader, 'application/json');

      for (final entry in headers.entries) {
        request.headers.set(entry.key, entry.value);
      }

      request.write(jsonEncode(body));

      final response = await request.close().timeout(timeout);
      final responseBody = await utf8.decoder
          .bind(response)
          .join()
          .timeout(timeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException(
          'POST $uri failed with status ${response.statusCode}: $responseBody',
          uri: uri,
        );
      }

      return responseBody;
    } finally {
      client.close(force: true);
    }
  }
}
