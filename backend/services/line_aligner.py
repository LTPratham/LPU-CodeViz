def align_line_number(original_code: str, predicted_line: int, code_trimmed: str) -> int:
    """
    Given the original code, a predicted line number (1-based), and the trimmed code snippet,
    finds the actual 1-based line number in original_code that matches the snippet.
    If multiple matches exist, resolves to the one closest to predicted_line.
    """
    if not code_trimmed or not isinstance(predicted_line, int):
        return predicted_line
        
    code_trimmed = code_trimmed.strip()
    if not code_trimmed:
        return predicted_line
        
    original_lines = original_code.splitlines()
    
    # Try to find exact matches
    exact_candidates = []
    for idx, orig_line in enumerate(original_lines):
        if orig_line.strip() == code_trimmed:
            exact_candidates.append(idx + 1)
            
    if exact_candidates:
        return min(exact_candidates, key=lambda c: abs(c - predicted_line))
        
    # Try substring matches if no exact match was found
    substring_candidates = []
    for idx, orig_line in enumerate(original_lines):
        orig_stripped = orig_line.strip()
        if orig_stripped and (code_trimmed in orig_stripped or orig_stripped in code_trimmed):
            substring_candidates.append(idx + 1)
            
    if substring_candidates:
        return min(substring_candidates, key=lambda c: abs(c - predicted_line))
        
    return predicted_line
