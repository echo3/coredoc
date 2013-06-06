package nextapp.coredoc;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.velocity.app.Velocity;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.coredoc.model.Instance;
import nextapp.coredoc.model.Module;
import nextapp.coredoc.util.DomUtil;
import nextapp.coredoc.util.StringUtil;

import nextapp.coredoc.parse.ModuleParser;
import nextapp.coredoc.render.CustomTagRender;
import nextapp.coredoc.render.Renderer;
import nextapp.coredoc.render.html.HtmlRenderer;
import nextapp.coredoc.render.xml.XmlRenderer;

/**
 * Main class, provides main() method for command-line execution.
 */
public class CoreDoc {
    
    /**
     * Global logger.
     */
    public static final Logger logger = Logger.getLogger("nextapp.coredoc");
    
    /**
     * Pattern matcher for embedded "${variable.name}" values contained in XML strings.
     */
    private static final Pattern PROPERTY_PATTERN = Pattern.compile("\\$\\{([0-9a-zA-Z\\.]+)\\}");

    /**
     * main() method implementation.
     * 
     * @param args command line arguments
     * @throws Exception
     */
    public static void main(String[] args) 
    throws Exception {
        // Ensure single argument specified.
        if (args.length != 1) {
            logger.log(Level.SEVERE, "Invalid arguments: specify location of doc.xml file.");
            System.exit(1);
        }
        
        // Create doc.xml file instance.
        File docXmlFile = new File(args[0]);

        // Ensure doc.xml file exists.
        if (!docXmlFile.exists()) {
            logger.log(Level.SEVERE, "doc.xml file \"" + args[0] + "\" cannot be found.");
            System.exit(1);
        }
        
        // Init velocity.
        Properties p = new Properties();
        p.setProperty("resource.loader", "class,file");
        p.setProperty("class.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        p.setProperty("file.resource.loader.class", "org.apache.velocity.runtime.resource.loader.FileResourceLoader");
        p.setProperty("file.resource.loader.path", docXmlFile.getParentFile().getAbsolutePath());
        Velocity.init(p);

        CoreDoc coreDoc = new CoreDoc(docXmlFile);
        coreDoc.execute();
        
        logger.log(Level.INFO, "Documentation successfully generated.");
    }
    
    /**
     * Parses a file value, replacing any variable names with values from system properties.
     * 
     * @param value the file value to parse
     * @return the parsed value
     */
    private static String parseFileValue(String value) {
         StringBuffer out = new StringBuffer();
         int lastIndex = 0;
         Matcher variableMatcher = PROPERTY_PATTERN.matcher(value);
         while (variableMatcher.find()) {
             out.append(value.substring(lastIndex, variableMatcher.start()));
             lastIndex = variableMatcher.end();
             String propertyName = variableMatcher.group(1);
             String propertyValue = System.getProperty(propertyName);
             if (propertyValue == null) {
                 throw new IllegalArgumentException("No property value provided for required property: \"" + propertyName + "\".");
             }
             out.append(propertyValue);
         }
         out.append(value.substring(lastIndex));
         return out.toString();
    }
    
    /** The <code>doc.xml</code> file. */
    private File docXmlFile;
    
    /** The output directory. */
    private File outputDirectory;
    
    /** The <code>doc.xml</code> document. */
    private Document document;
    
    /** The JavaScript model <code>Instance</code> object. */
    private Instance instance;
    
    /** The <code>Renderer</code> which will process the <code>Instance</code>. */
    private Renderer renderer;
    
    /**
     * Default constructor.  Performs configuration work, but does not begin documentation generation.
     * 
     * @param docXmlFile the <code>doc.xml</code> file.
     */
    CoreDoc(File docXmlFile) {
        super();
        this.docXmlFile = docXmlFile;

        String outputDirectoryName = System.getProperty("output");
        if (outputDirectoryName == null || outputDirectoryName.trim().length() == 0) {
            outputDirectoryName = DomUtil.getPropertyElementValue(document.getDocumentElement(), "output-dir");
            if (outputDirectoryName == null || outputDirectoryName.trim().length() == 0) {
                outputDirectoryName = "CoreDocOutput";
            }
        }
        outputDirectory = new File(outputDirectoryName);
    }
    
    /**
     * Creates the renderer based on the value of the system property <code>render</code>.
     */
    void createRenderer() {
        String renderArg = System.getProperty("render");
        if ("xml".equals(renderArg)) {
            logger.log(Level.INFO, "Initializing Renderer: XML");
            renderer = new XmlRenderer(instance);    
        } else {
            logger.log(Level.INFO, "Initializing Renderer: HTML");
            renderer = new HtmlRenderer(instance);    
        }
    }
    
    /**
     * Performs all documentation generation tasks.
     */
    public void execute() 
    throws Exception {
        loadDocXml();
        loadModel();
        createRenderer();
        render();
    }
    
    /**
     * Renders the documentation.
     */
    void render() throws Exception {
        renderer.setTitle(DomUtil.getPropertyElementValue(document.getDocumentElement(), "title"));
        
        String homeDirectoryName = DomUtil.getPropertyElementValue(document.getDocumentElement(), "home-dir");
        if (homeDirectoryName != null) {
            renderer.setHomeDirectory(new File(docXmlFile.getParentFile(), homeDirectoryName));
        }
        
        Element customTagElements[] = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "custom-tag");
        for (int i = 0; i < customTagElements.length; ++i) {
            Element[] templateElements = DomUtil.getChildElementsByTagName(customTagElements[i], "template");
            for (int j = 0; j < templateElements.length; ++j) {
                if (renderer.getName().equals(templateElements[j].getAttribute("type"))) {
                    CustomTagRender customTag = new CustomTagRender(DomUtil.getPropertyElementValue(customTagElements[i], "name"),
                            DomUtil.getElementText(templateElements[j]));
                    customTag.setRequiredType(DomUtil.getPropertyElementValue(customTagElements[i], "required-type"));
                    renderer.addCustomTag(customTag);
                }
            }
        }

        Element customTypeElements[] = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "custom-type");
        for (int i = 0; i < customTypeElements.length; ++i) {
            renderer.addCustomType(DomUtil.getPropertyElementValue(customTypeElements[i], "name"),
                    DomUtil.getPropertyElementValue(customTypeElements[i], "display"));
        }
        
        renderer.render(outputDirectory);
    }

    /**
     * Loads the doc.xml file into the <code>document</code> object.
     */
    private void loadDocXml() 
    throws FileNotFoundException, SAXException {
        // Read doc.xml file, create Document instance.
        InputStream in = new FileInputStream(docXmlFile);
        document = DomUtil.load(in);
    }
    
    /**
     * Creates the JavaScript model <code>Instance</code>.
     */
    void loadModel()
    throws IOException {
        instance = new Instance();
        
        Element modulesElements[] = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "modules");
        for (int i = 0; i < modulesElements.length; ++i) {
            File baseFile;
            if (modulesElements[i].hasAttribute("base") ) {
                //FIXME File.isAbsolute() always true, cannot find method in Java API to determine if path is relative or absolute.
                // Test if relative file exists, if not, try absolute path.
                baseFile = new File(docXmlFile.getParentFile(), parseFileValue(modulesElements[i].getAttribute("base")));
                if (!baseFile.exists()) {
                    baseFile = new File(parseFileValue(modulesElements[i].getAttribute("base")));
                }
            } else {
                baseFile = docXmlFile.getParentFile();
            }
            Element moduleElements[] = DomUtil.getChildElementsByTagName(modulesElements[i], "module");
            for (int j = 0; j < moduleElements.length; ++j) {
                String moduleName = parseFileValue(DomUtil.getElementText(moduleElements[j]));
                CoreDoc.logger.log(Level.INFO, "Parsing: " + moduleName);
                File moduleFile = new File(baseFile, moduleName);
                String moduleSource = StringUtil.getTextFile(moduleFile);
                Module module = ModuleParser.parse(instance, moduleFile, moduleSource);
                instance.addModule(module);
            }
        }
        
        instance.process();
    }
}
