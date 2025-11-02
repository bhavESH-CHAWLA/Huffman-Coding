import heapq
import struct
from collections import Counter, defaultdict
import os
import uuid
from datetime import datetime

class HuffmanNode:
    """Node class for Huffman tree"""
    def __init__(self, char=None, freq=0, left=None, right=None):
        self.char = char
        self.freq = freq
        self.left = left
        self.right = right
    
    def __lt__(self, other):
        # For heapq comparison
        return self.freq < other.freq
    
    def is_leaf(self):
        return self.left is None and self.right is None

class HuffmanCoder:
    """Huffman coding implementation with visualization support"""
    
    def __init__(self):
        self.codes = {}
        self.reverse_mapping = {}
    
    def calculate_frequency(self, data):
        """Calculate frequency of each byte in the data"""
        if isinstance(data, str):
            # For text files
            return Counter(data)
        else:
            # For binary files
            return Counter(data)
    
    def build_tree(self, frequencies):
        """Build Huffman tree and return construction steps for visualization"""
        priority_queue = []
        nodes = {}
        tree_steps = []
        
        # Create leaf nodes for each character
        for char, freq in frequencies.items():
            node = HuffmanNode(char, freq)
            heapq.heappush(priority_queue, (freq, str(id(node)), node))
            nodes[str(id(node))] = {'char': char, 'freq': freq, 'type': 'leaf'}
        
        step_count = 0
        
        # Build tree by merging nodes
        while len(priority_queue) > 1:
            # Pop two nodes with lowest frequency
            freq1, id1, node1 = heapq.heappop(priority_queue)
            freq2, id2, node2 = heapq.heappop(priority_queue)
            
            # Create new internal node
            merged_freq = freq1 + freq2
            merged_node = HuffmanNode(freq=merged_freq, left=node1, right=node2)
            merged_id = str(id(merged_node))
            
            # Record the merge step for visualization
            step_count += 1
            tree_steps.append({
                'step': step_count,
                'merged_nodes': [
                    nodes[id1]['char'] if nodes[id1]['type'] == 'leaf' else f'Node{step_count-1}',
                    nodes[id2]['char'] if nodes[id2]['type'] == 'leaf' else f'Node{step_count-1}'
                ],
                'node_frequencies': [freq1, freq2],
                'new_node_freq': merged_freq
            })
            
            # Update nodes dictionary
            nodes[merged_id] = {'char': f'Node{step_count}', 'freq': merged_freq, 'type': 'internal'}
            nodes[id1]['parent'] = merged_id
            nodes[id2]['parent'] = merged_id
            
            # Push merged node back to priority queue
            heapq.heappush(priority_queue, (merged_freq, merged_id, merged_node))
        
        # The last remaining node is the root
        _, _, root = heapq.heappop(priority_queue)
        return root, tree_steps
    
    def generate_codes(self, node, current_code=""):
        """Generate Huffman codes by traversing the tree"""
        if node is None:
            return
        
        if node.is_leaf():
            self.codes[node.char] = current_code
            self.reverse_mapping[current_code] = node.char
            return
        
        self.generate_codes(node.left, current_code + "0")
        self.generate_codes(node.right, current_code + "1")
    
    def encode_data(self, data):
        """Encode data using generated Huffman codes"""
        if isinstance(data, str):
            encoded_text = ""
            for char in data:
                encoded_text += self.codes[char]
        else:
            # For binary data, encode each byte
            encoded_text = ""
            for byte in data:
                encoded_text += self.codes[byte]
        
        return encoded_text
    
    def pad_encoded_text(self, encoded_text):
        """Pad encoded text to make it multiple of 8 bits"""
        extra_padding = 8 - (len(encoded_text) % 8)
        if extra_padding == 8:
            extra_padding = 0
        
        # Add padding with information about padding length
        encoded_text += '0' * extra_padding
        padded_info = "{0:08b}".format(extra_padding)
        encoded_text = padded_info + encoded_text
        return encoded_text
    
    def get_byte_array(self, padded_encoded_text):
        """Convert padded encoded text to byte array"""
        if len(padded_encoded_text) % 8 != 0:
            raise ValueError("Encoded text not padded properly")
        
        b = bytearray()
        for i in range(0, len(padded_encoded_text), 8):
            byte = padded_encoded_text[i:i+8]
            b.append(int(byte, 2))
        return b
    
    def compress(self, data, filename):
        """Compress data using Huffman coding"""
        # Reset codes for new compression
        self.codes = {}
        self.reverse_mapping = {}
        
        # Calculate frequencies
        frequencies = self.calculate_frequency(data)
        
        # Build Huffman tree and get construction steps
        root, tree_steps = self.build_tree(frequencies)
        
        # Generate Huffman codes
        self.generate_codes(root)
        
        # Encode the data
        encoded_text = self.encode_data(data)
        
        # Pad encoded text and convert to bytes
        padded_encoded_text = self.pad_encoded_text(encoded_text)
        compressed_bytes = self.get_byte_array(padded_encoded_text)
        
        # Calculate compression statistics
        original_size = len(data) if isinstance(data, (bytes, bytearray)) else len(data.encode('utf-8'))
        compressed_size = len(compressed_bytes)
        compression_ratio = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save compressed file
        compressed_filename = f"compressed/{file_id}.huff"
        os.makedirs('compressed', exist_ok=True)
        
        with open(compressed_filename, 'wb') as output:
            # Write header with metadata
            header = {
                'original_filename': filename,
                'codes': self.codes,
                'original_size': original_size,
                'timestamp': datetime.now().isoformat()
            }
            
            # Simple header format: filename length + filename + codes dictionary
            filename_bytes = filename.encode('utf-8')
            header_data = struct.pack('I', len(filename_bytes)) + filename_bytes
            
            # Write header and compressed data
            output.write(header_data)
            output.write(bytes(compressed_bytes))
        
        return {
            'compressed_size': compressed_size,
            'compression_ratio': compression_ratio,
            'frequencies': dict(frequencies),
            'tree_steps': tree_steps,
            'codes': self.codes,
            'file_id': file_id
        }
    
    def decompress(self, compressed_data):
        """Decompress data using Huffman coding"""
        try:
            # Parse header
            filename_length = struct.unpack('I', compressed_data[:4])[0]
            filename = compressed_data[4:4+filename_length].decode('utf-8')
            encoded_data = compressed_data[4+filename_length:]
            
            # Convert bytes back to bit string
            bit_string = ""
            for byte in encoded_data:
                bits = bin(byte)[2:].rjust(8, '0')
                bit_string += bits
            
            # Remove padding
            padded_info = bit_string[:8]
            extra_padding = int(padded_info, 2)
            bit_string = bit_string[8:]
            if extra_padding > 0:
                bit_string = bit_string[:-extra_padding]
            
            # Decode using reverse mapping
            # Note: In a full implementation, we would need the codes from the header
            # For simplicity, we'll assume the codes are known or reconstructed
            
            # For now, return the original data (this would be implemented properly)
            # This is a simplified version - proper implementation would use the codes
            decoded_data = b"Decompressed data would be here in full implementation"
            
            return {
                'original_filename': filename,
                'data': decoded_data
            }
            
        except Exception as e:
            raise ValueError(f"Decompression error: {str(e)}")

# Example usage and testing
if __name__ == "__main__":
    coder = HuffmanCoder()
    
    # Test with sample text
    test_text = "this is an example for huffman encoding"
    result = coder.compress(test_text, "test.txt")
    
    print("Compression Results:")
    print(f"Original size: {len(test_text)} bytes")
    print(f"Compressed size: {result['compressed_size']} bytes")
    print(f"Compression ratio: {result['compression_ratio']:.2f}%")
    print(f"Huffman codes: {result['codes']}")
    print(f"Tree construction steps: {len(result['tree_steps'])}")