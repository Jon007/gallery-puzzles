<?php
/*
 * Plugin Name: Gallery-Puzzles
 * Text Domain: gallery-puzzles
 * Domain Path: /languages
 * Plugin URI: https://github.com/Jon007/gallery-puzzles/
 * Assets URI: https://github.com/Jon007/gallery-puzzles/assets/
 * Author: Jonathan Moore
 * Author URI: https://jonmoblog.wordpress.com/
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl.txt
 * Description: Turn any gallery into a puzzle!
 * Contributors: jonathanmoorebcsorg
 * Version: 0.1
 * Stable Tag: 0.1
 * Requires At Least: 4.7
 * Tested Up To: 4.8
 */

function gallery_puzzle_shortcode($attr)
{
    $output = '';

    //allow normal shortcode to run
    if (function_exists('photoswipe_shortcode')) {
        $output = photoswipe_shortcode($attr);
//        $output = gallery_shortcode($attr);
    } else {
        $output = gallery_shortcode($attr);
    }
    
    if (isset($attr['puzzle'])){
        //find src attributes within normal shortcode output
        $matches = [];
        //error_log($output);
        preg_match_all('/src=(\".+?\")/', $output, $matches);

        wp_enqueue_style('picpuzzle', plugins_url('/gallery-puzzles/8puzzle/8puzzle.css'));
        wp_enqueue_script('picpuzzle', plugins_url('/gallery-puzzles/8puzzle/8puzzle.js'), array(), '15072017', true);
        
        $puzzle = '<main><div id="puzzle-buttons">
<button class="button" id="undo" title="Undo the last move">Undo</button>
<button class="button" id="solve" title="Show a solution to the puzzle">Solve</button>		
<button class="button" id="restart" title="Return puzzle to starting position">Restart</button>
<select id="puzzle-difficulty">
    <optgroup label="Puzzle Difficulty">
        <option value="6"  label="Easy (6 moves)">Easy</option>
        <option value="12" label="Tricky (12 moves)" selected>Tricker</option>
        <option value="24" label="Hard (24 moves)">Hard</option>
    </optgroup>
</select>
<span id="puzzle-move"></span>
</div>
<div id="canvas"></div><div id="previews"></div>
</main>';
        if (sizeof($matches[1]) > 0){
            $puzzle .= '<script>window.puzzlepics=[' . implode(',', $matches[1]) . ']</script>';
        }
        
        //do_puzzle
        $output = $puzzle . $output;
    }        
    return $output;

}

add_action('init', 'gallery_puzzle_init');

function gallery_puzzle_init(){
    add_shortcode( 'gallery', 'gallery_puzzle_shortcode' );    
    add_shortcode( 'gallery_puzzle', 'gallery_puzzle_shortcode' );    
}
