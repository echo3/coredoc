package nextapp.coredoc.render;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.coredoc.model.ClassBlock;
import nextapp.coredoc.model.Instance;
import nextapp.coredoc.util.FileUtil;

/**
 * Abstract base class for documentation renderers.
 */
public abstract class Renderer {
    
    /**
     * The JavaScript model <code>Instance</code>.
     */
    private Instance instance;
    
    /**
     * The output directory in which rendered documentation should be stored.
     */
    private File outputDirectory;
    
    /**
     * The source directory in which overview/"home" HTML content is located.
     */
    private File homeDirectory;
    
    /**
     * Mapping between model {@link ClassBlock} and renderer {@link ClassDO} objects.
     */
    private Map<ClassBlock, ClassDO> classBlockToClassRender = new HashMap<ClassBlock, ClassDO>();
    
    /**
     * Map between custom tags names and {@link CustomTagRender} objects.
     */
    private Map<String, CustomTagRender> customTagNameToTagRender = new HashMap<String, CustomTagRender>();
    
    /**
     * Map between custom type names and text which should be used in documentation to describe custom type.
     */
    private Map<String, String> customTypeToDisplayText = new HashMap<String, String>();
    
    /**
     * Generated documentation title.
     */
    private String title = "Generated Documentation";
    
    /**
     * Creates a new <code>Renderer</code>.
     * 
     * @param instance the JavaScript model {@link Instance}
     */
    public Renderer(Instance instance) {
        this.instance = instance;
    }
    
    public void addCustomTag(CustomTagRender customTag) {
        customTagNameToTagRender.put(customTag.getTagName(), customTag);
        customTag.setRenderer(this);
    }
    
    /**
     * Adds a custom type to the custom type-to-display text mapping.
     * 
     * @param typeName the custom type name
     * @param displayText the text which should be displayed in the documentation
     */
    public void addCustomType(String typeName, String displayText) {
        customTypeToDisplayText.put(typeName, displayText);
    }
    
    /**
     * Returns the display text for a specific custom type name.
     * 
     * @param typeName the type name
     * @return the display text
     */
    public String getCustomTypeDisplayText(String typeName) {
        return (String) customTypeToDisplayText.get(typeName);
    }
    
    /**
     * Returns the class data object for the specified class block, creating one if necessary.
     * 
     * @param classBlock the {@link ClassBlock}
     * @return the data object 
     */
    public ClassDO getClassRender(ClassBlock classBlock) {
        ClassDO classRender = classBlockToClassRender.get(classBlock);
        if (classRender == null) {
            classRender = new ClassDO(this, classBlock);
            classBlockToClassRender.put(classBlock, classRender);
        }
        return classRender;
    }
    
    /**
     * Returns the JavaScript model {@link Instance}
     * 
     * @return the model instance
     */
    public Instance getInstance() {
        return instance;
    }
    
    /**
     * Returns the source directory in which overview/"home" HTML content is located.
     * 
     * @return the directory
     */
    public File getHomeDirectory() {
        return homeDirectory;
    }
    
    /**
     * Returns the directory in which the generated documentation should be stored.
     * 
     * @return the directory
     */
    public File getOutputDirectory() {
        return outputDirectory;
    }
    
    /**
     * Returns the renderer name.
     * 
     * @return the renderer name
     */
    public abstract String getName();
    
    /**
     * Returns the custom tag renderer for the specified tag name.
     * 
     * @param tagName the tag name
     * @return the custom tag renderer
     */
    public CustomTagRender getTagRender(String tagName) {
        return (CustomTagRender) customTagNameToTagRender.get(tagName);
    }
   
    /**
     * Returns the names of all custom tag renderers.
     * 
     * @return the names
     */
    public Iterator<String> getTagRenderNames() {
        return Collections.unmodifiableSet(customTagNameToTagRender.keySet()).iterator();
    }
    
    /**
     * Returns the documentation title.
     * 
     * @return the documentation title
     */
    public String getTitle() {
        return title;
    }
    
    /**
     * Renders the documentation.
     * 
     * @param outputDirectory the directory in which the rendered documentation should be stored
     */
    public void render(File outputDirectory) 
    throws Exception {
        // Create output directory. 
        this.outputDirectory = outputDirectory;
        if (outputDirectory.exists() && (!outputDirectory.isDirectory() || !outputDirectory.canWrite())) {
            throw new IllegalArgumentException("Output path exists and is not writable.");
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdir();
        }
        
        // Copy contents of home directory to outputDirectory/home
        if (homeDirectory != null && homeDirectory.exists()) {
            File targetHomeDirectory = new File(outputDirectory, "home");
            FileUtil.copyDirectory(homeDirectory, targetHomeDirectory);
        }
    }
    
    /**
     * Sets the source directory in which overview/"home" HTML content is located.
     * 
     * @param homeDirectory the new directory
     */
    public void setHomeDirectory(File homeDirectory) {
        this.homeDirectory = homeDirectory;
    }
    
    /**
     * Sets the documentation title.
     * 
     * @param title the new documentation title
     */
    public void setTitle(String title) {
        this.title = title;
    }
}